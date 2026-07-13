import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { prisma } from './db.js';

export async function generateAndSaveTicketEmbedding(ticketId: string, subject: string, body: string) {
  try {
    const textToEmbed = `Title: ${subject}\n\nDescription: ${body}`;
    
    // Update to gemini-embedding-001 with output dimensionality 768 to match pgvector
    const { embedding } = await embed({
      model: google.embedding('gemini-embedding-001'),
      value: textToEmbed,
      providerOptions: {
        google: {
          outputDimensionality: 768,
        },
      },
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
