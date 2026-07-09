import { Router, type Request, type Response } from 'express';
import { prisma } from './db.js';
import { boss } from './queue.js';

const router = Router();

import multer from 'multer';

const upload = multer();

// Middleware to check webhook secret
router.use((req: Request, res: Response, next) => {
  const secret = req.headers['x-webhook-secret'] || req.query.secret;
  const expectedSecret = process.env.WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error('WEBHOOK_SECRET is not configured in environment variables');
    res.status(500).json({ error: 'Webhook configuration error' });
    return;
  }

  if (secret !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized webhook request' });
    return;
  }

  next();
});

// POST /api/webhooks/sendgrid
// Endpoint for SendGrid Inbound Parse
router.post('/sendgrid', upload.none(), async (req: Request, res: Response) => {
  try {
    const { subject, text, from } = req.body;
    
    // Parse the sender's email. SendGrid 'from' is often formatted as: "Name" <email@domain.com>
    let customerEmail = from;
    let customerName = 'Customer';
    
    const emailMatch = from?.match(/<([^>]+)>/);
    if (emailMatch) {
      customerEmail = emailMatch[1];
      const nameMatch = from.match(/^"?([^"<]+)"?\s*</);
      if (nameMatch) {
        customerName = nameMatch[1].trim();
      }
    }

    if (!subject || !text || !customerEmail) {
      res.status(400).send('Missing fields');
      return;
    }

    const aiAgent = await prisma.user.findUnique({
      where: { email: 'ai@samadhaan.com' }
    });

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        body: text,
        category: 'General_Questions',
        customerEmail,
        customerName,
        status: 'New',
        ...(aiAgent && { assignedToId: aiAgent.id })
      }
    });

    // Queue for classification
    boss.send('classify-ticket', { ticketId: ticket.id, subject, body: text, customerName })
      .catch(err => console.error('Failed to queue webhook classification job:', err));

    res.status(200).send('OK');
  } catch (err) {
    console.error('Error processing SendGrid webhook:', err);
    res.status(500).send('Error processing webhook');
  }
});

// POST /api/webhooks/tickets
// Endpoint to create a ticket from an external source
router.post('/tickets', async (req: Request, res: Response) => {
  try {
    const { subject, body, customerName, customerEmail, category } = req.body;
    
    // Basic validation
    if (!subject || !body || !customerEmail) {
      res.status(400).json({ error: 'Missing required fields: subject, body, and customerEmail are required' });
      return;
    }

    // Try to find the AI agent to assign the ticket to
    const aiAgent = await prisma.user.findUnique({
      where: { email: 'ai@samadhaan.com' }
    });

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        body,
        category: category || 'General_Questions',
        customerEmail,
        customerName: customerName || null,
        status: 'New',
        ...(aiAgent && { assignedToId: aiAgent.id })
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Ticket created successfully',
      ticketId: ticket.id
    });

    // Asynchronously classify the ticket in a non-blocking fashion using pg-boss
    boss.send('classify-ticket', { ticketId: ticket.id, subject, body, customerName })
      .catch(err => console.error('Failed to queue webhook classification job:', err));
  } catch (err: any) {
    console.error('Error processing webhook ticket creation:', err);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

export default router;
