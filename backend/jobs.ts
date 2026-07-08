import { boss } from './queue.js';
import { attachClassifyTicketWorker } from './workers/classifyTicket.worker.js';
import { attachSlaMonitorWorker } from './workers/slaMonitor.worker.js';

export async function startJobs() {
  await boss.start();
  console.log('pg-boss started');
  
  // Attach all workers
  await attachClassifyTicketWorker();
  await attachSlaMonitorWorker();

  // Schedule the SLA Monitor job to run every 15 minutes
  await boss.createQueue('sla-monitor');
  await boss.schedule('sla-monitor', '*/15 * * * *');
  console.log('SLA Monitor scheduled to run every 15 minutes');
}
