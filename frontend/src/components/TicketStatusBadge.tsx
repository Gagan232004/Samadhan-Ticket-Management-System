import { CATEGORY_LABELS, STATUS_LABELS } from '../lib/constants';
import type { Ticket } from '../types';

export default function TicketStatusBadge({ ticket }: { ticket: Ticket }) {
  const status = ticket.status;
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
      status === 'New' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
      status === 'Processing' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse' :
      status === 'Open' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
      status === 'Resolved' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' :
      'bg-zinc-500/10 text-slate-500 border-zinc-500/20'
    }`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
