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

// GET all unread notifications
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const notifications = await prisma.notification.findMany({
      where: { 
        userId: user.id,
        isRead: false
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(notifications);
  } catch (err: any) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST mark a notification as read
router.post('/:id/read', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id }
    });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    if (notification.userId !== user.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    
    res.json(updated);
  } catch (err: any) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router;
