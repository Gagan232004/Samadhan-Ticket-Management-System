import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.js";
import { prisma } from "./db.js";
import { createUserSchema } from '@ticketly/core';

dotenv.config();

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

// Basic Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'success', message: 'Express server is running on Bun!' });
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
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(users);
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📦 Shared core schema loaded successfully:`, !!createUserSchema);
});