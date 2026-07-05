import { prisma } from './db.js';
import { hashPassword } from 'better-auth/crypto';

async function run() {
  const email = 'admin@example.com';
  const newPassword = 'password123';
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`User ${email} not found!`);
    return;
  }
  
  const account = await prisma.account.findFirst({
    where: { userId: user.id }
  });
  
  const hashedPassword = await hashPassword(newPassword);
  
  if (account) {
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword }
    });
    console.log('Password updated in account.');
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
