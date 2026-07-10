import { groq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const kbContent = fs.readFileSync(path.join(__dirname, 'knowledge-base.md'), 'utf-8');

  const subject = "Going on a flight - need downloads";
  const body = "I'm going to be on an airplane for 12 hours tomorrow. is it possible for me to download the video lectures to watch them offline? I already downloaded the source code.";
  const customerName = "TestUser";

  console.log("Running Groq Llama 3.3...");

  try {
    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile'),
      schema: z.object({
        category: z.enum(['General_Questions', 'Technical_Questions', 'Refund_Request', 'Others']),
        priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
        canResolve: z.boolean(),
        resolutionText: z.string().describe('The reply to the customer if the issue can be resolved. MUST use \\n characters to format into multiple paragraphs and separate the signature.').optional(),
        reasoning: z.string().describe('Why did you decide to resolve or not resolve this?').optional()
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

    console.log("AI Output:", JSON.stringify(object, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
