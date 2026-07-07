import type { Ticket as PrismaTicket } from '@prisma/client';

export interface Ticket extends Omit<PrismaTicket, 'createdAt' | 'updatedAt'> {
  assignedTo?: { name: string; email: string } | null;
  replies?: any[];
  createdAt: string;
  updatedAt: string;
}
