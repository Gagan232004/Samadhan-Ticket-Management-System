import type { Ticket as PrismaTicket } from '@prisma/client';

export interface Ticket extends Omit<PrismaTicket, 'createdAt' | 'updatedAt'> {
  assignedTo?: { name: string; email: string } | null;
  category: 'General_Questions' | 'Technical_Questions' | 'Refund_Request' | 'Others';
  priority?: 'Critical' | 'High' | 'Medium' | 'Low';
  slaDeadline?: string;
  aiRiskLevel?: string;
  aiRiskScore?: number;
  aiRecommendation?: string;
  createdAt: string;
  updatedAt: string;
  replies?: any[];
  attachments?: any[];
}
