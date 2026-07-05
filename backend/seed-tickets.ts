import 'dotenv/config';
import { prisma } from './db.js';

async function seedTickets() {
  try {
    await prisma.ticket.createMany({
      data: [
        {
          subject: 'Cannot access my dashboard',
          body: 'Hi, whenever I try to log in, it just spins forever. Please help!',
          customerName: 'Sarah Jenkins',
          customerEmail: 'sarah.j@example.com',
          category: 'Technical_Questions',
          status: 'Open'
        },
        {
          subject: 'Refund for last month',
          body: 'I forgot to cancel my subscription before it renewed. Can I get a refund?',
          customerName: 'Marcus Wright',
          customerEmail: 'mwright99@example.com',
          category: 'Refund_Request',
          status: 'Open'
        }
      ]
    });
    console.log('Successfully added 2 sample tickets.');
  } catch (error) {
    console.error('Error seeding tickets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTickets();
