import { prisma } from './db.js';

async function run() {
  const email = 'admin@example.com';
  const newPassword = 'password123';
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`User ${email} not found! We should create it.`);
    // Let's create an admin user!
    const newUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: email,
        role: 'admin',
        emailVerified: true
      }
    });
    console.log('Created user:', newUser);
    const hashedPassword = await Bun.password.hash(newPassword);
    await prisma.account.create({
      data: {
        userId: newUser.id,
        accountId: email,
        providerId: 'credential',
        password: hashedPassword
      }
    });
    console.log('Account/password created.');
  } else {
    console.log(`User ${email} found! Updating password...`);
    // Find account
    const account = await prisma.account.findFirst({
      where: { userId: user.id }
    });
    
    const hashedPassword = await Bun.password.hash(newPassword);
    
    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: { password: hashedPassword }
      });
      console.log('Password updated in account.');
    } else {
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: email,
          providerId: 'credential',
          password: hashedPassword
        }
      });
      console.log('Account created with new password.');
    }
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
