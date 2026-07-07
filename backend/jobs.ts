import { boss } from './queue.js';
import { prisma } from './db.js';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function startJobs() {
  await boss.start();
  console.log('pg-boss started');

  await boss.createQueue('classify-ticket');

  await boss.work('classify-ticket', async (jobs) => {
    const jobArray = Array.isArray(jobs) ? jobs : [jobs];
    
    for (const job of jobArray) {
      const { ticketId, subject, body } = job.data as { ticketId: string, subject: string, body: string };
      
      console.log(`Processing classify-ticket job for ticket ${ticketId}`);
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
          console.log(`Automatically classified ticket ${ticketId} as ${object.category} via pg-boss`);
        }
      } catch (error) {
        console.error(`Failed to automatically classify ticket ${ticketId} in pg-boss:`, error);
        throw error; // Throw so pg-boss knows it failed
      }
    }
  });
}
