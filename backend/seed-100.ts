import 'dotenv/config';
import { prisma } from './db.js';

const firstNames = ['Sarah', 'Marcus', 'John', 'Emily', 'David', 'Jessica', 'Michael', 'Amanda', 'Robert', 'Jennifer', 'William', 'Elizabeth', 'Joseph', 'Melissa', 'Thomas', 'Megan', 'Charles', 'Rachel', 'Christopher', 'Lauren'];
const lastNames = ['Jenkins', 'Wright', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore'];

const subjects = [
  'Cannot access my dashboard',
  'Refund for last month',
  'How do I change my password?',
  'Feature request: Dark mode',
  'App keeps crashing on startup',
  'Billing issue - charged twice',
  'Need help setting up integration',
  'Where is my data stored?',
  'Upgrade to Pro plan',
  'Cancel my subscription'
];

const bodies = [
  'Hi, whenever I try to log in, it just spins forever. Please help!',
  'I forgot to cancel my subscription before it renewed. Can I get a refund?',
  'I cannot find the option to reset my password anywhere in the settings.',
  'Please add a dark mode, my eyes hurt at night.',
  'The app crashes immediately when I open the dashboard.',
  'I was charged twice on my credit card this month. Please refund one.',
  'I am having trouble connecting my Slack account.',
  'Is my data stored in Europe or the US?',
  'I want to upgrade but my card is being declined.',
  'Please cancel my account immediately, I no longer need it.'
];

const categories = ['General_Questions', 'Technical_Questions', 'Refund_Request', 'Others'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];

async function seed100() {
  console.log('Generating 100 random tickets...');
  
  const ticketsToCreate = [];
  
  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const subjectIndex = Math.floor(Math.random() * subjects.length);
    
    // Randomize dates over the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    // Add SLA deadline for Open tickets
    const slaDeadline = new Date(createdAt);
    slaDeadline.setHours(slaDeadline.getHours() + 24); // 24 hour SLA
    
    // 70% chance of being Open, 30% chance of being Resolved
    const isResolved = Math.random() > 0.7;
    const status = isResolved ? 'Resolved' : 'Open';
    const updatedAt = isResolved ? new Date(createdAt.getTime() + (Math.random() * 20 * 60 * 60 * 1000)) : new Date(); // Resolved within 20 hours
    
    ticketsToCreate.push({
      subject: subjects[subjectIndex] + ` (#${i + 1000})`,
      body: bodies[subjectIndex],
      customerName: `${firstName} ${lastName}`,
      customerEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      category: categories[Math.floor(Math.random() * categories.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: status,
      createdAt: createdAt,
      updatedAt: updatedAt,
      slaDeadline: isResolved ? null : slaDeadline
    });
  }
  
  try {
    await prisma.ticket.createMany({
      data: ticketsToCreate
    });
    console.log('Successfully created 100 tickets in the database!');
  } catch (error) {
    console.error('Failed to create tickets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed100();
