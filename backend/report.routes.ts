import { Router, type Request, type Response } from 'express';
import { prisma } from './db.js';
import { auth } from './auth.js';
import { fromNodeHeaders } from 'better-auth/node';

const router = Router();

// Middleware to check authentication
router.use(async (req: Request, res: Response, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  if (!session || !session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  (req as any).user = session.user;
  next();
});

// GET /api/reports/agents
router.get('/agents', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Admins see all agents, agents only see themselves
    const agents = await prisma.user.findMany({
      where: user.role === 'admin' ? { role: 'agent' } : { id: user.id },
      select: { id: true, name: true, email: true, image: true }
    });

    const reportData = await Promise.all(agents.map(async (agent) => {
      // 1. Total resolved tickets
      const resolvedCount = await prisma.ticket.count({
        where: {
          assignedToId: agent.id,
          status: { in: ['Resolved', 'Closed'] }
        }
      });

      // 2. Currently assigned open tickets
      const openCount = await prisma.ticket.count({
        where: {
          assignedToId: agent.id,
          status: { in: ['New', 'Processing', 'Open'] }
        }
      });

      // 3. Average resolution time and SLA Compliance
      const resolvedTickets = await prisma.ticket.findMany({
        where: {
          assignedToId: agent.id,
          status: { in: ['Resolved', 'Closed'] }
        },
        select: { createdAt: true, updatedAt: true, slaDeadline: true }
      });

      let totalResolutionTime = 0;
      let slaMetCount = 0;
      let ticketsWithSlaCount = 0;

      resolvedTickets.forEach(t => {
        const resolutionTime = new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime();
        totalResolutionTime += resolutionTime;

        if (t.slaDeadline) {
          ticketsWithSlaCount++;
          if (new Date(t.updatedAt).getTime() <= new Date(t.slaDeadline).getTime()) {
            slaMetCount++;
          }
        }
      });

      const avgResolutionTimeHours = resolvedTickets.length > 0 
        ? (totalResolutionTime / resolvedTickets.length) / (1000 * 60 * 60)
        : 0;

      const slaComplianceRate = ticketsWithSlaCount > 0
        ? (slaMetCount / ticketsWithSlaCount) * 100
        : 100;

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        image: agent.image,
        resolvedCount,
        openCount,
        avgResolutionTimeHours: parseFloat(avgResolutionTimeHours.toFixed(2)),
        slaComplianceRate: parseFloat(slaComplianceRate.toFixed(2))
      };
    }));

    res.json(reportData);
  } catch (error) {
    console.error('Error fetching agent reports:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
