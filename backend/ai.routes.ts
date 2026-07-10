import { Router, type Request, type Response } from 'express';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { auth } from './auth.js';
import { fromNodeHeaders } from 'better-auth/node';

const router = Router();

// Middleware to check authentication
router.use(async (req: Request, res: Response, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  if (!session || !session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.locals.user = session.user;
  next();
});

router.post('/polish', async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { text, customerName } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const { text: polishedText } = await generateText({
      model: google('gemini-1.5-flash'),
      system: `You are an expert Customer Support Assistant.

Your task is to rewrite and polish customer support replies while preserving their original meaning.

Instructions:
- Correct grammar, spelling, and punctuation.
- Make the reply professional, polite, and empathetic.
- Improve clarity and readability.
- Keep the response concise unless more detail is required.
- Do NOT change the intent or add information that was not provided.
- Do NOT make promises or commitments that are not mentioned.
- Maintain a friendly and customer-focused tone.
- Return ONLY the polished reply without explanations, notes, or quotation marks, but DO use newlines to separate paragraphs and the signature.
- Always address the customer by their first name at the beginning of the reply (e.g., "Hi [Name],"): ${customerName || 'Customer'}
- Always sign the reply at the very end with "Best regards," followed by the agent's name: ${user.name}`,
      prompt: text
    });

    res.json({ polishedText });
  } catch (err: any) {
    console.error('Error polishing text:', err);
    res.status(500).json({ error: 'Failed to polish text' });
  }
});

router.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { ticketData } = req.body;
    if (!ticketData) {
      res.status(400).json({ error: 'Ticket data is required' });
      return;
    }

    const { text: summary } = await generateText({
      model: google('gemini-1.5-flash'),
      system: `You are an expert Customer Support Analyst.

Your task is to summarize a support ticket and its conversation history.

Instructions:
- Provide a concise summary of the main issue.
- Outline the current status or what has been done so far.
- Keep the summary professional, clear, and easy to read.
- Use a few bullet points if there are multiple steps taken (using standard dashes).
- Do NOT use Markdown formatting such as asterisks (**) for bolding. Output plain text only.
- Do NOT include any filler text. Return ONLY the summary.`,
      prompt: `Ticket Subject: ${ticketData.subject}\nTicket Body: ${ticketData.body}\n\nConversation History:\n${ticketData.replies?.map((r: any) => `[${r.senderType}] ${r.senderType === 'CUSTOMER' ? ticketData.customerName || 'Customer' : r.sender?.name || 'Agent'}: ${r.body}`).join('\n\n') || 'No replies yet.'}`
    });

    res.json({ summary });
  } catch (err: any) {
    console.error('Error summarizing ticket:', err);
    res.status(500).json({ error: 'Failed to summarize ticket' });
  }
});

export default router;
