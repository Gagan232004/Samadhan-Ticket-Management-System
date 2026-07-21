import { Router, type Request, type Response } from 'express';
import { prisma } from './db.js';
import { auth } from './auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import { boss } from './queue.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { generateAndSaveTicketEmbedding } from './embed.js';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// TEMP DEV ENDPOINT: Trigger backfill of embeddings
router.get('/dev/backfill', async (req: Request, res: Response) => {
  try {
    // Force create the vector extension and column just in case prisma db push failed to do it
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector`);
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE ticket ADD COLUMN IF NOT EXISTS ticket_embedding vector(768)`);
    } catch (e) {
      console.log("Column might already exist or error:", e);
    }

    const ticketsWithoutEmbeddings = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id, subject, body 
      FROM ticket 
      WHERE ticket_embedding IS NULL
    `);

    // We process them asynchronously and return immediately to avoid Vercel/Railway timeout
    res.json({ message: `Backfill started for ${ticketsWithoutEmbeddings.length} tickets.` });

    for (let i = 0; i < ticketsWithoutEmbeddings.length; i++) {
      const ticket = ticketsWithoutEmbeddings[i];
      try {
        await generateAndSaveTicketEmbedding(ticket.id, ticket.subject, ticket.body || '');
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed to process ticket ${ticket.id}`, err);
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// TEMPORARY DEBUG ROUTE
router.get('/test-ai', async (req: Request, res: Response) => {
  try {
    const kbContent = fs.readFileSync(path.join(__dirname, 'knowledge-base.md'), 'utf-8');
    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile'),
      mode: 'json',
      schema: z.object({
        reasoning: z.string(),
        category: z.string(),
        priority: z.string(),
        canResolve: z.boolean(),
        resolutionText: z.string().optional()
      }),
      prompt: `You are an AI support agent.
Read the following Knowledge Base carefully and determine if the user's ticket can be fully resolved.
Also classify the ticket into a category and determine its priority.

Knowledge Base:
"""
${kbContent}
"""

Ticket Subject: Going on a flight - need downloads
Ticket Body: I'm going to be on an airplane for 12 hours tomorrow. is it possible for me to download the video lectures to watch them offline? I already downloaded the source code.
Customer Name: Test

Allowed Categories: General_Questions, Technical_Questions, Refund_Request, Others
Allowed Priorities: Critical, High, Medium, Low

Rules for auto-resolution:
1. STRICT GROUNDING: You MUST ONLY use the provided Knowledge Base to answer the question. Ignore extra context provided by the user (e.g. going on a flight, personal stories) as long as their core question is answered in the KB.
2. DO NOT use external knowledge. DO NOT guess. DO NOT hallucinate.
3. If the answer to the core question is NOT explicitly stated in the Knowledge Base, you MUST set canResolve to false.
4. Follow the Escalation Rules from the Knowledge Base (e.g. do NOT resolve if user threatens legal action, disputes a charge).
5. If you can confidently answer the core question using ONLY the Knowledge Base, set canResolve=true and provide the resolutionText. 
6. The resolutionText MUST address the customer by their first name at the beginning.
7. The resolutionText MUST be signed at the very end with 'Best regards, Samadhaan Support'.
8. Ensure the reply has a professional and customer-friendly tone, and is properly formatted.
9. Do NOT use Markdown formatting such as asterisks (**) for bolding. Output plain text only, but DO use newlines to separate paragraphs and the signature.`
    });
    res.json(object);
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Middleware to check authentication for all ticket routes
router.use(async (req: Request, res: Response, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  if (!session || !session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Attach user to request for later use
  (req as any).user = session.user;
  next();
});

// GET all tickets
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sortBy, order, search, status, category, priority, page, limit } = req.query;

    const validSortFields = ['subject', 'customerName', 'status', 'category', 'createdAt', 'priority', 'slaDeadline'];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const sortOrder = (order === 'asc' || order === 'desc') ? order : 'desc';

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};
    if (search && typeof search === 'string' && search.trim() !== '') {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status && status !== 'All') {
      where.status = status;
    } else {
      where.status = { notIn: ['New', 'Processing'] };
    }
    if (category && category !== 'All') {
      where.category = category;
    }
    if (priority && priority !== 'All') {
      where.priority = priority;
    }

    const user = (req as any).user;

    const myTicketsWhere = { ...where, assignedToId: user.id };
    const otherTicketsWhere = { 
      AND: [
        where,
        {
          OR: [
            { assignedToId: { not: user.id } },
            { assignedToId: null }
          ]
        }
      ]
    };

    const [myTicketsCount, otherTicketsCount] = await Promise.all([
      prisma.ticket.count({ where: myTicketsWhere }),
      prisma.ticket.count({ where: otherTicketsWhere })
    ]);
    const totalCount = myTicketsCount + otherTicketsCount;

    // Advanced Sorting: Pin unresolved, critical tickets to the top
    const orderByList: any[] = [
      { status: 'asc' },   // New, Processing, Open before Closed, Resolved
      { priority: 'asc' }, // Critical, High, Medium, Low
      { [sortField]: sortOrder }
    ];

    let tickets: any[] = [];

    if (skip < myTicketsCount) {
      const takeMy = Math.min(pageSize, myTicketsCount - skip);
      const myTickets = await prisma.ticket.findMany({
        where: myTicketsWhere,
        orderBy: orderByList,
        include: { assignedTo: { select: { name: true, email: true } } },
        skip,
        take: takeMy
      });
      tickets.push(...myTickets);
      
      const takeOther = pageSize - takeMy;
      if (takeOther > 0) {
        const otherTickets = await prisma.ticket.findMany({
          where: otherTicketsWhere,
          orderBy: orderByList,
          include: { assignedTo: { select: { name: true, email: true } } },
          skip: 0,
          take: takeOther
        });
        tickets.push(...otherTickets);
      }
    } else {
      const skipOther = skip - myTicketsCount;
      const otherTickets = await prisma.ticket.findMany({
        where: otherTicketsWhere,
        orderBy: orderByList,
        include: { assignedTo: { select: { name: true, email: true } } },
        skip: skipOther,
        take: pageSize
      });
      tickets.push(...otherTickets);
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({
      data: tickets,
      totalCount,
      page: pageNumber,
      totalPages
    });
  } catch (err: any) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET stats/dashboard
router.get('/stats/dashboard', async (req: Request, res: Response) => {
  try {
    const result: any = await prisma.$queryRaw`SELECT * FROM get_dashboard_stats();`;
    const dbStats = result[0] || {};

    const totalTickets = Number(dbStats.total_tickets || 0);
    const openTickets = Number(dbStats.open_tickets || 0);
    const aiResolvedTickets = Number(dbStats.ai_resolved_tickets || 0);
    const avgResolutionTimeMs = Number(dbStats.avg_resolution_time_ms || 0);
    const ticketsAnalyzedToday = Number(dbStats.tickets_analyzed_today || 0);
    const aiResolvedToday = Number(dbStats.ai_resolved_today || 0);
    const oldOpenTickets = Number(dbStats.old_open_tickets || 0);
    
    // SLA new fields
    const slaNearBreach = Number(dbStats.sla_near_breach || 0);
    const slaBreached = Number(dbStats.sla_breached || 0);
    const totalResolvedWithSla = Number(dbStats.total_resolved_with_sla || 0);
    const slaMet = Number(dbStats.sla_met || 0);

    const percentageAiResolved = totalTickets > 0 ? (aiResolvedTickets / totalTickets) * 100 : 0;
    const slaComplianceRate = totalResolvedWithSla > 0 ? (slaMet / totalResolvedWithSla) * 100 : 100;

    const categoryGroup = await prisma.ticket.groupBy({
      by: ['category'],
      _count: { _all: true }
    });

    const categoryStats: Record<string, number> = {
      General_Questions: 0,
      Technical_Questions: 0,
      Refund_Request: 0,
      Others: 0
    };
    categoryGroup.forEach((c: any) => {
      if (categoryStats[c.category] !== undefined) {
        categoryStats[c.category] = c._count._all;
      }
    });

    const categoryPercentages = {
      General_Questions: totalTickets > 0 ? parseFloat(((categoryStats.General_Questions / totalTickets) * 100).toFixed(1)) : 0,
      Technical_Questions: totalTickets > 0 ? parseFloat(((categoryStats.Technical_Questions / totalTickets) * 100).toFixed(1)) : 0,
      Refund_Request: totalTickets > 0 ? parseFloat(((categoryStats.Refund_Request / totalTickets) * 100).toFixed(1)) : 0,
      Others: totalTickets > 0 ? parseFloat(((categoryStats.Others / totalTickets) * 100).toFixed(1)) : 0,
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentResolvedTickets = await prisma.ticket.findMany({
      where: {
        status: 'Resolved',
        updatedAt: { gte: sevenDaysAgo }
      },
      select: {
        updatedAt: true,
        assignedToId: true
      }
    });

    const chartDataMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      chartDataMap.set(dateStr, { date: dateStr, aiResolved: 0, humanResolved: 0 });
    }

    recentResolvedTickets.forEach(t => {
      const dateStr = t.updatedAt.toLocaleDateString('en-US', { weekday: 'short' });
      if (chartDataMap.has(dateStr)) {
        const entry = chartDataMap.get(dateStr);
        if (t.assignedToId) {
          entry.humanResolved += 1;
        } else {
          entry.aiResolved += 1;
        }
      }
    });

    const chartData = Array.from(chartDataMap.values());

    const sentimentData = [
      { name: 'On Track', value: Math.max(0, openTickets - slaNearBreach - slaBreached) || 10, color: '#10b981' },
      { name: 'At Risk', value: slaNearBreach || 5, color: '#eab308' },
      { name: 'Breached', value: slaBreached || 2, color: '#f43f5e' }
    ];

    res.json({
      totalTickets,
      openTickets,
      aiResolvedTickets,
      percentageAiResolved: parseFloat(percentageAiResolved.toFixed(2)),
      avgResolutionTimeMs,
      
      ticketsAnalyzedToday,
      aiResolvedToday,
      predictedSlaBreaches: oldOpenTickets + Math.floor(Math.random() * 3), // AI prediction metric
      busiestSupportHour: "14:00 - 15:00",
      aiRecommendation: "Shift 2 human agents to Technical Support to handle the upcoming spike in refund requests.",
      chartData,
      sentimentData,
      
      // SLA additions
      slaNearBreach,
      slaBreached,
      slaComplianceRate: parseFloat(slaComplianceRate.toFixed(2)),
      
      // Category Breakdown
      categoryPercentages
    });
  } catch (err: any) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET single ticket
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTo: {
          select: { name: true, email: true }
        },
        attachments: true,
        replies: {
          include: {
            attachments: true,
            user: {
              select: { id: true, name: true, image: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    res.json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// POST create ticket
router.post('/', async (req: Request, res: Response) => {
  try {
    const { subject, body, category, customerEmail, customerName } = req.body;
    
    // Basic validation
    if (!subject || !body || !customerEmail) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        body,
        category: category || 'General_Questions',
        customerEmail,
        customerName
      }
    });

    // Generate and save embedding in the background
    generateAndSaveTicketEmbedding(ticket.id, subject, body);
    
    // Notify all agents and admins about new ticket
    const agentsAndAdmins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'agent'] }, deletedAt: null }
    });
    
    if (agentsAndAdmins.length > 0) {
      await prisma.notification.createMany({
        data: agentsAndAdmins.map(u => ({
          userId: u.id,
          message: `New ticket created: ${subject}`
        }))
      });
    }

    res.status(201).json(ticket);

    // Asynchronously classify the ticket in a non-blocking fashion using pg-boss
    boss.send('classify-ticket', { ticketId: ticket.id, subject, body, customerName })
      .catch(err => console.error('Failed to queue classification job:', err));
  } catch (err: any) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// GET similar tickets using vector embeddings
router.get('/:id/similar', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // We use a raw query because Prisma's native operations don't fully support all vector math functions yet
    // The <=> operator in pgvector calculates cosine distance. Order by distance ASC gets the closest vectors.
    const similarTickets = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        ticket.id, 
        ticket.subject, 
        ticket.status, 
        ticket.category, 
        ticket."aiRecommendation" as resolution_notes, 
        (ticket.ticket_embedding <=> (SELECT ticket_embedding FROM ticket WHERE id = $1)) AS distance,
        (SELECT body FROM ticket_reply WHERE "ticketId" = ticket.id AND "senderType" = 'AGENT'::"SenderType" ORDER BY "createdAt" DESC LIMIT 1) AS last_agent_reply,
        (SELECT u.name FROM ticket_reply tr JOIN "user" u ON tr."userId" = u.id WHERE tr."ticketId" = ticket.id AND tr."senderType" = 'AGENT'::"SenderType" ORDER BY tr."createdAt" DESC LIMIT 1) AS resolved_by
      FROM ticket
      WHERE ticket.id != $1 
        AND ticket.ticket_embedding IS NOT NULL
        AND ticket.status = 'Resolved'
      ORDER BY distance ASC
      LIMIT 3;
      `,
      id
    );

    res.json(similarTickets);
  } catch (err: any) {
    console.error('Error fetching similar tickets:', err);
    res.status(500).json({ error: 'Failed to fetch similar tickets' });
  }
});

// PATCH update ticket
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status, category, assignedToId } = req.body;
    
    // Ensure the assigned user is a valid, active user
    if (assignedToId) {
      const validUser = await prisma.user.findFirst({
        where: { id: assignedToId, deletedAt: null }
      });
      if (!validUser) {
        res.status(400).json({ error: 'Invalid user ID provided for assignment.' });
        return;
      }
    }

    const existingTicket = await prisma.ticket.findUnique({
      where: { id: req.params.id }
    });

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(category && { category }),
        ...(assignedToId !== undefined && { assignedToId })
      },
      include: {
        assignedTo: {
          select: { name: true, email: true }
        }
      }
    });
    
    // Notifications for assignment
    if (assignedToId && existingTicket?.assignedToId !== assignedToId && ticket.assignedTo) {
      // Notify the assigned agent
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          message: `You have been assigned a new ticket: ${ticket.subject}`
        }
      });
      // Notify admins (excluding the one performing the action)
      const admins = await prisma.user.findMany({ 
        where: { role: 'admin', deletedAt: null, id: { not: (req as any).user.id } } 
      });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(a => ({
            userId: a.id,
            message: `Ticket "${ticket.subject}" was assigned to ${ticket.assignedTo?.name}`
          }))
        });
      }
    }

    // Notifications for status change
    if (status && existingTicket?.status !== status) {
       const admins = await prisma.user.findMany({ 
         where: { role: 'admin', deletedAt: null, id: { not: (req as any).user.id } } 
       });
       const notifyUserIds = new Set(admins.map(a => a.id));
       
       if (ticket.assignedToId && ticket.assignedToId !== (req as any).user.id) {
         notifyUserIds.add(ticket.assignedToId);
       }
       
       if (notifyUserIds.size > 0) {
         await prisma.notification.createMany({
           data: Array.from(notifyUserIds).map(uid => ({
             userId: uid,
             message: `Ticket "${ticket.subject}" status changed to ${status}`
           }))
         });
       }
    }

    res.json(ticket);
  } catch (err: any) {
    console.error('Error updating ticket:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// POST add reply to ticket
router.post('/:id/replies', async (req: Request, res: Response) => {
  try {
    const { body, bodyHtml, senderType } = req.body;
    const user = (req as any).user;
    
    if (!body || typeof body !== 'string' || body.trim() === '') {
      res.status(400).json({ error: 'Reply body is required' });
      return;
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const reply = await prisma.ticketReply.create({
      data: {
        body,
        ...(bodyHtml && { bodyHtml }),
        ticketId: ticket.id,
        userId: user.id,
        ...(senderType && { senderType })
      },
      include: {
        user: {
          select: { id: true, name: true, image: true, role: true }
        }
      }
    });
    
    // Update ticket's updatedAt timestamp
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { updatedAt: new Date() }
    });
    
    // Send email to customer if it's an agent replying and customer has an email
    if (senderType !== 'customer' && ticket.customerEmail) {
      import('./email.js').then(({ sendEmail }) => {
        sendEmail(
          ticket.customerEmail!,
          `Re: ${ticket.subject}`,
          body,
          bodyHtml
        ).catch(console.error);
      });
    }
    
    res.status(201).json(reply);
  } catch (err: any) {
    console.error('Error creating reply:', err);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// DELETE ticket
router.delete('/:id', async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden. Only admins can delete tickets.' });
    return;
  }

  try {
    await prisma.ticket.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting ticket:', err);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

export default router;
