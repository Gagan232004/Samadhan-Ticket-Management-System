import { boss } from './queue.js';
import { attachClassifyTicketWorker } from './workers/classifyTicket.worker.js';
import { attachSlaMonitorWorker } from './workers/slaMonitor.worker.js';
import { attachGmailWorker } from './workers/gmail.worker.js';

export async function startJobs() {
  await boss.start();
  console.log('pg-boss started');
  
  // Create queues before attaching workers
  await boss.createQueue('classify-ticket');
  await boss.createQueue('sla-monitor');
  await boss.schedule('sla-monitor', '*/15 * * * *');
  console.log('SLA Monitor scheduled to run every 15 minutes');

  await boss.createQueue('gmail-sync');
  await boss.schedule('gmail-sync', '* * * * *');
  console.log('Gmail Sync scheduled to run every 1 minute');
  
  // Attach all workers
  await attachClassifyTicketWorker();
  await attachSlaMonitorWorker();
  await attachGmailWorker();
}
