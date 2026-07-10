import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { prisma } from './db.js';

export async function generateAndSaveTicketEmbedding(ticketId: string, subject: string, body: string) {
  try {
    const textToEmbed = `Title: ${subject}\n\nDescription: ${body}`;
    
    // We use gemini-1.5-flash for everything else, but for embeddings google provides text-embedding-004
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: textToEmbed,
    });

    // Update the ticket record in the DB with the embedding using raw SQL
    // pgvector uses the format '[val1, val2, ...]'
    const embeddingString = `[${embedding.join(',')}]`;
    
    await prisma.$executeRawUnsafe(
      `UPDATE ticket SET ticket_embedding = $1::vector WHERE id = $2`,
      embeddingString,
      ticketId
    );

    console.log(`Generated and saved embedding for ticket ${ticketId}`);
  } catch (error) {
    console.error(`Failed to generate embedding for ticket ${ticketId}:`, error);
  }
}
