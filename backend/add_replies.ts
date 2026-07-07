import { SenderType } from '@prisma/client';
import { prisma } from './db.js';

const customerMessages = [
  "Hello, any updates on my subscription issue?",
  "I tried to renew again today and got the same error. Please help.",
  "Is there an issue with my credit card on file?",
  "This is very frustrating, I need access to my account.",
  "Can you please expedite this?",
  "I called my bank and they said no transaction was even attempted.",
  "Are your payment servers down?",
  "I'm attaching a screenshot of the error, although it just says 'Payment Failed'.",
  "Could it be an issue with my billing address?",
  "If this isn't resolved soon I might have to switch to another service.",
  "Any ETA on a fix?",
  "I still can't access my premium features.",
  "Please let me know if I should try using PayPal instead.",
  "I've been a loyal customer for 3 years, please fix this.",
  "Is anyone actually looking into this?",
  "I cleared my cache and cookies but it didn't help.",
  "Tried on my phone, same error.",
  "What is the status of this ticket?",
  "I really need this working by tomorrow.",
  "Can you manually process the renewal on your end?",
  "Thanks for the update, but it's still not working.",
  "I just tried again. Failed again.",
  "Should I just create a new account?",
  "I'm losing patience.",
  "Is there a phone number I can call for support?"
];

const agentMessages = [
  "We are actively investigating your subscription failure. Thank you for your patience.",
  "Our billing team is looking into the logs right now.",
  "We suspect it might be a temporary gateway issue. Please hold on.",
  "Could you confirm the last 4 digits of the card you are trying to use?",
  "We have escalated this to our senior payment specialists.",
  "It looks like there might be a mismatch with the zip code. Have you moved recently?",
  "We are seeing a high volume of payment timeouts today, which might be related.",
  "Please do not try to process the payment again yet, to avoid duplicate charges.",
  "Our engineers are currently deploying a fix for the payment gateway.",
  "Thank you for the screenshot. That helps our team.",
  "We appreciate your loyalty and we are working hard to resolve this.",
  "I've manually verified your account status in our system.",
  "We will update you as soon as the engineering team reports back.",
  "Yes, you can try PayPal as a temporary workaround if you'd like.",
  "We are still monitoring the issue, but no resolution just yet.",
  "I'm so sorry for the delay, we understand this is frustrating.",
  "We are doing everything we can to expedite this.",
  "A manual renewal unfortunately cannot bypass the current gateway error.",
  "Our payment processor has acknowledged the outage.",
  "We expect to have this resolved within the next few hours.",
  "I've extended your premium access manually for 7 days while we fix this.",
  "Could you try using an incognito window?",
  "The issue seems to be isolated to Visa cards at the moment.",
  "Thank you for bearing with us during this unexpected downtime.",
  "I will personally follow up on this ticket first thing tomorrow morning."
];

async function main() {
  let ticket = await prisma.ticket.findFirst({
    where: { subject: { contains: 'Subscription renewal failed', mode: 'insensitive' } }
  });

  if (!ticket) {
    ticket = await prisma.ticket.findFirst({
      where: { customerName: { contains: 'James Davis', mode: 'insensitive' } }
    });
  }

  if (!ticket) {
    console.error('Ticket not found.');
    process.exit(1);
  }

  console.log(`Found ticket: "${ticket.subject}" by ${ticket.customerName}`);

  // Delete all existing mock replies (those matching 'reply')
  await prisma.ticketReply.deleteMany({
    where: {
      ticketId: ticket.id,
      body: {
        contains: 'reply'
      }
    }
  });
  console.log('Deleted old generic mock replies.');

  const replies = [];
  for (let i = 0; i < 50; i++) {
    const isCustomer = i % 2 === 0;
    
    // Pick a random message or cycle through the arrays
    const msgArray = isCustomer ? customerMessages : agentMessages;
    const msg = msgArray[Math.floor(i / 2) % msgArray.length];

    replies.push({
      body: msg,
      ticketId: ticket.id,
      senderType: isCustomer ? SenderType.CUSTOMER : SenderType.AGENT,
    });
  }

  await prisma.ticketReply.createMany({
    data: replies
  });

  console.log('Successfully added 50 varied and realistic replies.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
