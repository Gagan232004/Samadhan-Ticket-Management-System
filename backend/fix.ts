import { prisma } from './db.js';
async function fix() {
  await prisma.ticket.update({
    where: { id: 'cmrccewc000013cmi8322v922' },
    data: {
      priority: 'Critical',
      slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000)
    }
  });
  console.log('Fixed ticket priority and deadline');
}
fix();
