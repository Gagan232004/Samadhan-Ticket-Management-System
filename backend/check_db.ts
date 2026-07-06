import { prisma } from './db.js';

async function check() {
  const ticket = await prisma.ticket.findFirst({
    orderBy: { updatedAt: 'desc' },
    include: { assignedTo: true }
  });
  console.log(JSON.stringify(ticket, null, 2));
  process.exit(0);
}

check();
