import { prisma } from './db.js';
import crypto from 'crypto';

async function main() {
  const aiEmail = 'ai@samadhaan.com';
  
  const existingAi = await prisma.user.findUnique({
    where: { email: aiEmail }
  });

  if (existingAi) {
    console.log('AI Agent already exists with id:', existingAi.id);
    process.exit(0);
  }

  const id = crypto.randomUUID();
  
  const aiAgent = await prisma.user.create({
    data: {
      id,
      name: 'AI Agent',
      email: aiEmail,
      emailVerified: true,
      role: 'agent',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  
  console.log('AI Agent created successfully with id:', aiAgent.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
