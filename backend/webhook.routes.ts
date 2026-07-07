import { Router, type Request, type Response } from 'express';
import { prisma } from './db.js';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

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
        status: 'Open' // Default status for new incoming tickets
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Ticket created successfully',
      ticketId: ticket.id
    });

    // Asynchronously classify the ticket in a non-blocking fashion
    classifyTicket(ticket.id, subject, body).catch(err => console.error('Background classification failed:', err));
  } catch (err: any) {
    console.error('Error processing webhook ticket creation:', err);
    res.status(500).json({ error: 'Failed to process webhook' });
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
      console.log(`Automatically classified webhook ticket ${ticketId} as ${object.category}`);
    }
  } catch (error) {
    console.error(`Failed to automatically classify webhook ticket ${ticketId}:`, error);
  }
}

export default router;
