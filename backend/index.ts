import * as Sentry from "@sentry/node";
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.js";
import { prisma } from "./db.js";
import { createUserSchema } from '@ticketly/core';
import { startJobs } from './jobs.js';
dotenv.config();

// Ensure Sentry is initialized as early as possible
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.VITE_SENTRY_ENVIRONMENT || "development",
    integrations: [],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
  });
}
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Auth Route
app.all(/^\/api\/auth(?:\/.*)?$/, toNodeHandler(auth.handler));

// Basic Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Ticketly Backend API! 🚀 The server is running successfully. Check /api/health for status.');
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'success', message: 'Express server is running on Bun!' });
});

import ticketRoutes from './ticket.routes.js';
app.use('/api/tickets', ticketRoutes);

import webhookRoutes from './webhook.routes.js';
app.use('/api/webhooks', webhookRoutes);

import notificationRoutes from './notification.routes.js';
app.use('/api/notifications', notificationRoutes);

import aiRoutes from './ai.routes.js';
app.use('/api/ai', aiRoutes);

import reportRoutes from './report.routes.js';
app.use('/api/reports', reportRoutes);

import uploadRoutes from './upload.routes.js';
app.use('/api/uploads', uploadRoutes);

import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Agents List Route (Accessible to all authenticated users)
app.get('/api/users/agents', async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  if (!session || !session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const agents = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true
    },
    where: {
      deletedAt: null
    },
    orderBy: {
      name: 'asc'
    }
  });

  res.json(agents);
});

// Users Route
app.get('/api/users', async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  if (!session || !session.user || session.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true
    },
    where: {
      deletedAt: null
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(users);
});

// Delete User Route (Soft Delete)
app.delete('/api/users/:id', async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  if (!session || !session.user || session.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { id } = req.params;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (targetUser.role === 'admin') {
      res.status(400).json({ error: 'Cannot delete admin users' });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        banned: true,
        banReason: 'Account deleted'
      }
    });

    // Revoke any active sessions for this user so they are immediately logged out
    await prisma.session.deleteMany({
      where: { userId: id }
    });

    // Unassign tickets assigned to this user
    await prisma.ticket.updateMany({
      where: { assignedToId: id },
      data: { assignedToId: null }
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Global Error Handler
Sentry.setupExpressErrorHandler(app);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📦 Shared core schema loaded successfully:`, !!createUserSchema);
  
  try {
    await startJobs();
  } catch (e) {
    console.error('Failed to start background jobs', e);
  }
});



