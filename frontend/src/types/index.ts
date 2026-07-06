export interface Ticket {
  id: string;
  subject: string;
  body: string;
  status: 'Open' | 'Closed' | 'Resolved';
  category: 'General_Questions' | 'Technical_Questions' | 'Refund_Request' | 'Others';
  customerEmail: string;
  customerName: string | null;
  assignedToId: string | null;
  assignedTo?: { name: string; email: string } | null;
  replies?: any[];
  createdAt: string;
  updatedAt: string;
}
