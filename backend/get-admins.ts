import { prisma } from './db.js';

async function run() {
  const users = await prisma.user.findMany({ where: { role: 'admin' } });
  console.log('Admins:', users.map(u => u.email));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
