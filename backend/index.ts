import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth Route
app.all(/^\/api\/auth(?:\/.*)?$/, toNodeHandler(auth.handler));

// Basic Route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'success', message: 'Express server is running on Bun!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});