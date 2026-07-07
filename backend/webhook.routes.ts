import { Router, type Request, type Response } from 'express';
import { prisma } from './db.js';
import { boss } from './queue.js';

const router = Router();

// Middleware to check webhook secret
router.use((req: Request, res: Response, next) => {
  const secret = req.headers['x-webhook-secret'];
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

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        body,
        category: category || 'General_Questions',
        customerEmail,
        customerName: customerName || null,
        status: 'New'
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
