import { prisma } from './db.js';

async function run() {
  await prisma.user.updateMany({
    where: { deletedAt: { not: null } },
    data: { banned: true, banReason: 'Account deleted' }
  });
  
  await prisma.session.deleteMany({
    where: { user: { deletedAt: { not: null } } }
  });
  
  console.log('Fixed deleted users');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
