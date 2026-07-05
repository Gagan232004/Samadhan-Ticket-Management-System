import { auth } from './auth.js';
import { prisma } from './db.js';

async function run() {
  const email = 'admin@example.com';
  const password = 'password123';

  // Delete existing user if any
  try {
    await prisma.user.delete({ where: { email } });
    console.log('Deleted existing admin user.');
  } catch (e) {
    console.log('No existing admin user found to delete.');
  }

  // Create new user using Better Auth API
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: 'Admin User',
      }
    });
    console.log('Created new admin user via Better Auth API.');
    
    // Set role to admin (better auth signUp creates user, we must set role manually)
    await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });
    console.log('Set user role to admin.');
  } catch (err: any) {
    console.error('Failed to create user:', err);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
