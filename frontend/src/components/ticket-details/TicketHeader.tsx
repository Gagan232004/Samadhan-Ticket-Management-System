import type { Ticket } from '../../types';
import { parseTicketId } from '../../lib/utils';

interface TicketHeaderProps {
  ticket: Ticket;
}

export default function TicketHeader({ ticket }: TicketHeaderProps) {
  return (
    <div className="flex-1 mt-2">
      <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-6 leading-tight">
        {ticket.subject}
      </h1>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shadow-inner border border-slate-100">
          {(ticket.customerName || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-800 leading-tight">{ticket.customerName || 'Unknown Customer'}</span>
          <span className="text-xs text-slate-400">{ticket.customerEmail}</span>
        </div>
      </div>
      
      <div className="flex items-center flex-wrap gap-4 text-sm text-slate-400 font-medium">
        <span>ID: <span className="text-slate-500 font-mono">{parseTicketId(ticket.id)}</span></span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-100"></span>
        <span>Opened {new Date(ticket.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-100"></span>
        <span>Updated {new Date(ticket.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}
