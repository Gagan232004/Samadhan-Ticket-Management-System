import { auth } from './auth.js';
import { prisma } from './db.js';

async function testApi() {
  const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!adminUser) return console.log('No admin found');

  const session = await prisma.session.create({
    data: {
      id: 'mock-session-' + Date.now(),
      token: 'mock-token-' + Date.now(),
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 100000),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  const req = new Request('http://localhost:5000/api/auth/admin/create-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:5173',
      'Cookie': `better-auth.session_token=${session.token}`
    },
    body: JSON.stringify({
      email: `mock-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Mock',
      role: 'agent' 
    })
  });
  
  const res = await auth.handler(req);
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}
testApi().catch(console.error).finally(() => process.exit(0));
