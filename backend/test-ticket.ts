import { prisma } from './db.js';

async function run() {
  const ticket = await prisma.ticket.create({
    data: {
      subject: 'My login is not working',
      body: 'I tried resetting my password but I never got an email.',
      customerEmail: 'testuser@example.com',
      customerName: 'Test User',
      category: 'Technical Questions',
      status: 'Open'
    }
  });
  console.log('Created test ticket:', ticket);
}

run().catch(console.error).finally(() => prisma.$disconnect());
