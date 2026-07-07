import { boss } from './queue.js';
import { attachClassifyTicketWorker } from './workers/classifyTicket.worker.js';

export async function startJobs() {
  await boss.start();
  console.log('pg-boss started');
  
  // Attach all workers
  await attachClassifyTicketWorker();
}
