import { auth } from './auth.js';
import { prisma } from './db.js';

async function testApi() {
  try {
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!adminUser) return console.log('No admin found');

    const session = await prisma.session.create({
      data: {
        id: 'api-session-' + Date.now(),
        token: 'api-token-' + Date.now(),
        userId: adminUser.id,
        expiresAt: new Date(Date.now() + 100000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const headers = new Headers();
    headers.set('Origin', 'http://localhost:5173');
    headers.set('Cookie', `better-auth.session_token=${session.token}`);

    // Call the internal API
    const result = await (auth.api as any).adminCreateUser({
      body: {
        email: 'api-' + Date.now() + '@example.com',
        password: 'password123',
        name: 'Api',
        role: 'agent'
      },
      headers
    });
    
    console.log('Result:', result);
  } catch (err: any) {
    console.log('Error name:', err.name);
    console.log('Error message:', err.message);
    console.log('Error code:', err.code);
    console.log('Error status:', err.status);
    console.log('Error details:', err.body || err.details);
  }
}
testApi().catch(console.error).finally(() => process.exit(0));
