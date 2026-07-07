import { Router, type Request, type Response } from 'express';
import { prisma } from './db.js';
import { auth } from './auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const router = Router();

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
    const { sortBy, order, search, status, category, page, limit } = req.query;

    const validSortFields = ['subject', 'customerName', 'status', 'category', 'createdAt'];
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
    }
    if (category && category !== 'All') {
      where.category = category;
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

    let tickets: any[] = [];

    if (skip < myTicketsCount) {
      const takeMy = Math.min(pageSize, myTicketsCount - skip);
      const myTickets = await prisma.ticket.findMany({
        where: myTicketsWhere,
        orderBy: { [sortField]: sortOrder },
        include: { assignedTo: { select: { name: true, email: true } } },
        skip,
        take: takeMy
      });
      tickets.push(...myTickets);
      
      const takeOther = pageSize - takeMy;
      if (takeOther > 0) {
        const otherTickets = await prisma.ticket.findMany({
          where: otherTicketsWhere,
          orderBy: { [sortField]: sortOrder },
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
        orderBy: { [sortField]: sortOrder },
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

// GET single ticket
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTo: {
          select: { name: true, email: true }
        },
        replies: {
          include: {
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

    // Asynchronously classify the ticket in a non-blocking fashion
    classifyTicket(ticket.id, subject, body).catch(err => console.error('Background classification failed:', err));
  } catch (err: any) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
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

async function classifyTicket(ticketId: string, subject: string, body: string) {
  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: z.object({
        category: z.enum(['General_Questions', 'Technical_Questions', 'Refund_Request', 'Others'])
      }),
      prompt: `Classify the following support ticket into one of the allowed categories.
      
Ticket Subject: ${subject}
Ticket Body: ${body}

Allowed Categories:
- General_Questions (account issues, inquiries, pricing, etc.)
- Technical_Questions (bugs, errors, how-to use features, platform down)
- Refund_Request (asking for money back, disputing charges, cancellation)
- Others (anything else that does not fit)
`
    });

    if (object.category) {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { category: object.category }
      });
      console.log(`Automatically classified ticket ${ticketId} as ${object.category}`);
    }
  } catch (error) {
    console.error(`Failed to automatically classify ticket ${ticketId}:`, error);
  }
}

export default router;
