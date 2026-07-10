import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { prisma } from '../db.js';
import { boss } from '../queue.js';

export async function attachGmailWorker() {
  await boss.work('gmail-sync', async () => {
    console.log('Running Gmail Sync Job...');

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.log('Gmail credentials not configured. Skipping Gmail sync.');
      return;
    }

    const config = {
      imap: {
        user: user,
        password: pass,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 10000,
        tlsOptions: { rejectUnauthorized: false }
      }
    };

    try {
      const connection = await imaps.connect(config);
      await connection.openBox('INBOX');

      // Search for unread emails
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: true // Mark as read so we don't process them again
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      console.log(`Found ${messages.length} unread emails in Gmail inbox.`);

      for (const item of messages) {
        // Parse the full email message
        const all = item.parts.find(part => part.which === '');
        if (!all) continue;
        
        const mail = await simpleParser(all.body);
        
        const subject = mail.subject || 'No Subject';
        const body = mail.text || mail.html || 'No Content';
        
        // Extract customer name and email
        const fromAddress = mail.from?.value[0]?.address || 'unknown@example.com';
        const fromName = mail.from?.value[0]?.name || 'Customer';

        // Check if we already created a ticket for this Message-ID to prevent duplicates
        const messageId = mail.messageId;
        
        console.log(`Processing incoming email from ${fromAddress}: ${subject}`);

        const aiAgent = await prisma.user.findUnique({
          where: { email: 'ai@samadhaan.com' }
        });

        // Create the ticket
        const ticket = await prisma.ticket.create({
          data: {
            subject: subject,
            body: body,
            category: 'General_Questions', // Default, AI will reclassify
            priority: 'Medium',            // Default, AI will reclassify
            customerEmail: fromAddress,
            customerName: fromName,
            status: 'New',
            ...(aiAgent && { assignedToId: aiAgent.id })
          }
        });

        console.log(`Created Ticket #${ticket.id} from Gmail`);

        // Queue for AI classification
        await boss.send('classify-ticket', { 
          ticketId: ticket.id, 
          subject: subject, 
          body: body, 
          customerName: fromName 
        });
      }

      connection.end();
    } catch (err) {
      console.error('Error syncing Gmail:', err);
    }
  });
}
