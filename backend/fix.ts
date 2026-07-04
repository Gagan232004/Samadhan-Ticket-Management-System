import { prisma } from './db.js';

async function main() {
  const users = await prisma.user.updateMany({
    data: { role: 'admin' }
  });
  console.log(`Updated ${users.count} users to admin role`);
}

main().catch(console.error).finally(() => process.exit(0));
