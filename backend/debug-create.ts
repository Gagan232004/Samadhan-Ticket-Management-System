import { prisma } from './db.js';

async function debug() {
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!adminUser) return console.log('No admin found');

  const session = await prisma.session.create({
    data: {
      id: 'debug-session-' + Date.now(),
      token: 'debug-token-' + Date.now(),
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 100000),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  const res = await fetch('http://localhost:5000/api/auth/admin/create-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5173',
      'Cookie': `better-auth.session_token=${session.token}`
    },
    body: JSON.stringify({
      email: `debug-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Debug',
      role: 'agent' 
    })
  });
  
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}
debug().catch(console.error).finally(() => process.exit(0));
