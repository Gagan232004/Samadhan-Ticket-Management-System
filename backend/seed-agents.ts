import 'dotenv/config';
import { prisma } from './db.js';
import { auth } from './auth.js';

async function seedAgents() {
  console.log('Seeding custom agents (Rudra and Gagan)...');

  const agents = [
    { name: 'Rudra', email: 'rudra@example.com', password: 'password123' },
    { name: 'Gagan', email: 'gagan@example.com', password: 'password123' }
  ];

  // Temporarily bypass disableSignUp by modifying the options object
  const originalDisableSignUp = auth.options.emailAndPassword?.disableSignUp;
  if (auth.options.emailAndPassword) {
      auth.options.emailAndPassword.disableSignUp = false;
  }

  try {
    for (const agent of agents) {
      const existingUser = await prisma.user.findUnique({
        where: { email: agent.email }
      });

      if (existingUser) {
        console.log(`Agent ${agent.name} (${agent.email}) already exists.`);
        continue;
      }

      const response = await auth.api.signUpEmail({
        body: {
          email: agent.email,
          password: agent.password,
          name: agent.name
        }
      });

      if (response.user) {
        // Update role to agent
        await prisma.user.update({
          where: { email: agent.email },
          data: { role: 'agent' }
        });
        console.log(`✅ Successfully created agent: ${agent.name}`);
      }
    }
  } catch (error) {
    console.error('Error seeding agents:', error);
  } finally {
    // Restore the original configuration
    if (auth.options.emailAndPassword) {
        auth.options.emailAndPassword.disableSignUp = originalDisableSignUp;
    }
    await prisma.$disconnect();
  }
}

seedAgents();
