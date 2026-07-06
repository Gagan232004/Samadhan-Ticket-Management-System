import { Router, type Request, type Response } from 'express';
import { prisma } from './db.js';
import { auth } from './auth.js';
import { fromNodeHeaders } from 'better-auth/node';

const router = Router();

// Middleware to check authentication for all ticket routes
router.use(async (req: Request, res: Response, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  if (!session || !session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Attach user to request for later use
  (req as any).user = session.user;
  next();
});

// GET all tickets
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sortBy, order, search, status, category, page, limit } = req.query;

    const validSortFields = ['subject', 'customerName', 'status', 'category', 'createdAt'];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const sortOrder = (order === 'asc' || order === 'desc') ? order : 'desc';

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};
    if (search && typeof search === 'string' && search.trim() !== '') {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status && status !== 'All') {
      where.status = status;
    }
    if (category && category !== 'All') {
      where.category = category;
    }

    const [tickets, totalCount] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        include: {
          assignedTo: {
            select: { name: true, email: true }
          }
        },
        skip,
        take: pageSize
      }),
      prisma.ticket.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    res.json({
      data: tickets,
      totalCount,
      page: pageNumber,
      totalPages
    });
  } catch (err: any) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET single ticket
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTo: {
          select: { name: true, email: true }
        }
      }
    });
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    res.json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// POST create ticket
router.post('/', async (req: Request, res: Response) => {
  try {
    const { subject, body, category, customerEmail, customerName } = req.body;
    
    // Basic validation
    if (!subject || !body || !customerEmail) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        body,
        category: category || 'General_Questions',
        customerEmail,
        customerName
      }
    });
    
    res.status(201).json(ticket);
  } catch (err: any) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// PATCH update ticket
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status, category, assignedToId } = req.body;
    
    // Ensure the assigned user is a valid, active user
    if (assignedToId) {
      const validUser = await prisma.user.findFirst({
        where: { id: assignedToId, deletedAt: null }
      });
      if (!validUser) {
        res.status(400).json({ error: 'Invalid user ID provided for assignment.' });
        return;
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(category && { category }),
        ...(assignedToId !== undefined && { assignedToId })
      },
      include: {
        assignedTo: {
          select: { name: true, email: true }
        }
      }
    });
    
    res.json(ticket);
  } catch (err: any) {
    console.error('Error updating ticket:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// DELETE ticket
router.delete('/:id', async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden. Only admins can delete tickets.' });
    return;
  }

  try {
    await prisma.ticket.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting ticket:', err);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

export default router;
