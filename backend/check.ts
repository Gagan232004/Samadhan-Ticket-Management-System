import { prisma } from './db.js';
async function main() {
  const t = await prisma.ticket.findUnique({ where: { id: 'cmrccewc000013cmi8322v922' } });
  console.log('TICKET STATUS:', t?.status);
  console.log('TICKET PRIORITY:', t?.priority);
}
main();
