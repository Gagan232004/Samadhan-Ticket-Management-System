import { boss } from '../queue.js';
import { prisma } from '../db.js';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function attachClassifyTicketWorker() {
  await boss.createQueue('classify-ticket');

  const kbContent = fs.readFileSync(path.join(__dirname, '../knowledge-base.md'), 'utf-8');

  await boss.work('classify-ticket', async (jobs) => {
    const jobArray = Array.isArray(jobs) ? jobs : [jobs];
    
    for (const job of jobArray) {
      const { ticketId, subject, body, customerName } = job.data as { ticketId: string, subject: string, body: string, customerName?: string };
      
      const aiAgent = await prisma.user.findUnique({ where: { email: 'ai@samadhaan.com' } });
      
      console.log(`Processing classify-ticket job for ticket ${ticketId}`);
      try {
        const currentTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!currentTicket || currentTicket.status === 'Resolved' || currentTicket.status === 'Closed') {
          console.log(`Ticket ${ticketId} is already ${currentTicket?.status}. Skipping AI classification.`);
          continue;
        }

        // Mark as Processing
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: 'Processing' }
        });

        const { object } = await generateObject({
          model: google('gemini-3.1-flash-lite-preview'),
          schema: z.object({
            category: z.enum(['General_Questions', 'Technical_Questions', 'Refund_Request', 'Others']),
            priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
            canResolve: z.boolean(),
            resolutionText: z.string().describe('The reply to the customer if the issue can be resolved. MUST use \\n characters to format into multiple paragraphs and separate the signature.').optional()
          }),
          prompt: `You are an AI support agent.
Read the following Knowledge Base carefully and determine if the user's ticket can be fully resolved.
Also classify the ticket into a category and determine its priority.

Knowledge Base:
"""
${kbContent}
"""

Ticket Subject: ${subject}
Ticket Body: ${body}
Customer Name: ${customerName || 'Customer'}

Allowed Categories:
- General_Questions (account issues, inquiries, pricing, etc.)
- Technical_Questions (bugs, errors, how-to use features, platform down)
- Refund_Request (asking for money back, disputing charges, cancellation)
- Others (anything else that does not fit)

Allowed Priorities:
- Critical (platform down, data loss, immediate severe impact)
- High (major feature broken, time-sensitive issue)
- Medium (normal bugs, standard questions)
- Low (feature requests, non-urgent inquiries)

Rules for auto-resolution:
1. STRICT GROUNDING: You MUST ONLY use the provided Knowledge Base to answer the question.
2. DO NOT use external knowledge. DO NOT guess. DO NOT hallucinate.
3. If the answer is NOT explicitly stated in the Knowledge Base, you MUST set canResolve to false.
4. Follow the Escalation Rules from the Knowledge Base (e.g. do NOT resolve if user threatens legal action, disputes a charge, or if confidence is low).
5. If you can confidently answer the question using ONLY the Knowledge Base, set canResolve=true and provide the resolutionText. 
6. The resolutionText MUST address the customer by their first name at the beginning.
7. The resolutionText MUST be signed at the very end with 'Best regards, Samadhaan Support'.
8. Ensure the reply has a professional and customer-friendly tone, and is properly formatted.
9. Do NOT use Markdown formatting such as asterisks (**) for bolding. Output plain text only, but DO use newlines to separate paragraphs and the signature.`
        });

        // Calculate SLA Deadline based on priority
        let hours = 24;
        if (object.priority === 'Critical') hours = 2;
        else if (object.priority === 'High') hours = 4;
        else if (object.priority === 'Medium') hours = 8;
        
        const slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);

        if (object.canResolve && object.resolutionText) {
          // Add a reply
          await prisma.ticketReply.create({
            data: {
              ticketId,
              body: object.resolutionText,
              senderType: 'AGENT',
              ...(aiAgent && { userId: aiAgent.id })
            }
          });

          // Mark resolved
          const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId },
            data: { 
              category: object.category,
              priority: object.priority,
              slaDeadline,
              status: 'Resolved'
            }
          });
          
          if (updatedTicket.customerEmail) {
            import('../email.js').then(({ sendEmail }) => {
              sendEmail(
                updatedTicket.customerEmail!,
                `Re: ${updatedTicket.subject}`,
                object.resolutionText!
              ).catch(console.error);
            });
          }
          
          console.log(`Auto-resolved ticket ${ticketId} (Priority: ${object.priority}) and sent email.`);
        } else {
          // Couldn't resolve, mark Open and unassign from AI
          await prisma.ticket.update({
            where: { id: ticketId },
            data: { 
              category: object.category,
              priority: object.priority,
              slaDeadline,
              status: 'Open',
              assignedToId: null
            }
          });
          console.log(`Classified ticket ${ticketId} as ${object.category} / ${object.priority}, marked Open and unassigned`);
        }
      } catch (error) {
        console.error(`Failed to process ticket ${ticketId} in pg-boss:`, error);
        // Fallback to Open and unassign if something crashes
        try {
          await prisma.ticket.update({
            where: { id: ticketId },
            data: { status: 'Open', assignedToId: null }
          });
        } catch(e) {}
        throw error;
      }
    }
  });
}
