import { PrismaClient } from '@prisma/client';
import { generateAndSaveTicketEmbedding } from './embed.js';

const prisma = new PrismaClient();

async function backfill() {
  console.log('Starting backfill of ticket embeddings...');
  
  // Find all tickets that don't have embeddings yet
  // Since we can't query unsupported vector column directly for NULL easily using Prisma ORM methods,
  // we can just fetch all tickets and use raw query to check, or just process tickets that might be missing them.
  // Actually, we can fetch all tickets and regenerate for all, or filter via raw query.
  
  const ticketsWithoutEmbeddings = await prisma.$queryRawUnsafe<any[]>(`
    SELECT id, subject, body 
    FROM ticket 
    WHERE ticket_embedding IS NULL
  `);

  console.log(`Found ${ticketsWithoutEmbeddings.length} tickets missing embeddings.`);

  for (let i = 0; i < ticketsWithoutEmbeddings.length; i++) {
    const ticket = ticketsWithoutEmbeddings[i];
    console.log(`[${i + 1}/${ticketsWithoutEmbeddings.length}] Processing Ticket ID: ${ticket.id}`);
    
    try {
      await generateAndSaveTicketEmbedding(ticket.id, ticket.subject, ticket.body || '');
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`Failed to process ticket ${ticket.id}`, err);
    }
  }

  console.log('Backfill complete!');
}

backfill()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
