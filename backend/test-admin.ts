import { auth } from './auth.js';
import { prisma } from './db.js';

async function test() {
  try {
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!adminUser) return console.log('No admin found');
    
    // Create a temporary session for the admin
    const session = await prisma.session.create({
      data: {
        id: 'test-session-' + Date.now(),
        token: 'test-token-' + Date.now(),
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
        email: 'test2@example.com',
        password: 'password123',
        name: 'Test2',
        role: 'agent' 
      })
    });
    
    const res = await auth.handler(req);
    console.log(res.status);
    console.log(await res.text());
  } catch (err) {
    console.error(err);
  }
}
test();
