import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { prisma } from './db.js';
import { auth } from './auth.js';
import { fromNodeHeaders } from 'better-auth/node';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

const upload = multer({ storage });

// POST /api/uploads
router.post('/', upload.array('files'), async (req: Request, res: Response) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    const uploaderId = session?.user?.id || null;

    const files = req.files as Express.Multer.File[];
    const { ticketId, replyId } = req.body;

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    if (!ticketId) {
      res.status(400).json({ error: 'ticketId is required' });
      return;
    }

    const attachments = [];
    for (const file of files) {
      const url = `/uploads/${file.filename}`;

      const attachment = await prisma.attachment.create({
        data: {
          filename: file.originalname,
          url,
          mimetype: file.mimetype,
          size: file.size,
          ticketId,
          replyId: replyId || null,
          uploaderId,
        }
      });
      attachments.push(attachment);
    }

    res.json({ success: true, attachments });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
