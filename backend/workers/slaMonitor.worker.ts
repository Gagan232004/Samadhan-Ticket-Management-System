import { boss } from '../queue.js';
import { prisma } from '../db.js';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export async function attachSlaMonitorWorker() {
  await boss.work('sla-monitor', async () => {
    console.log('Running SLA Monitor Job...');
    
    // Find all Open tickets that have an SLA deadline
    const openTickets = await prisma.ticket.findMany({
      where: {
        status: 'Open',
        slaDeadline: { not: null }
      }
    });

    console.log(`Found ${openTickets.length} Open tickets to analyze for SLA risk.`);

    for (const ticket of openTickets) {
      try {
        const timeSinceCreationHrs = (Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
        const hoursRemaining = (ticket.slaDeadline!.getTime() - Date.now()) / (1000 * 60 * 60);
        
        // Predict SLA breach risk
        const { object } = await generateObject({
          model: google('gemini-3.1-flash-lite-preview'),
          schema: z.object({
            aiRiskLevel: z.enum(['Low', 'Medium', 'High']).describe('Risk level of breaching the SLA.'),
            aiRiskScore: z.number().min(0).max(100).describe('Confidence score from 0 to 100.'),
            aiRecommendation: z.string().describe('A smart recommendation for the agent.')
          }),
          prompt: `You are an AI Support Manager. Analyze this ticket to predict if it will breach its SLA.

Ticket Data:
- Subject: ${ticket.subject}
- Priority: ${ticket.priority}
- Category: ${ticket.category}
- Time since creation: ${timeSinceCreationHrs.toFixed(1)} hours
- Time remaining until SLA breach: ${hoursRemaining.toFixed(1)} hours

Instructions:
1. If hours remaining is negative, it has ALREADY breached. Risk is High (100%).
2. If time remaining is short (< 2 hours for Medium/Low, < 1 hour for Critical/High), Risk is High.
3. Provide a recommendation like "Escalate to manager", "Assign to experienced agent", or "Send reminder".
`
        });

        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            aiRiskLevel: object.aiRiskLevel,
            aiRiskScore: object.aiRiskScore,
            aiRecommendation: object.aiRecommendation
          }
        });
      } catch (err) {
        console.error(`Failed to analyze SLA for ticket ${ticket.id}:`, err);
      }
    }
  });
}
