import type { Ticket } from '../../types';
import DOMPurify from 'dompurify';
import TicketHeader from './TicketHeader';
import TicketDropdowns from './TicketDropdowns';

interface TicketDetailProps {
  ticket: Ticket;
  agents: {id: string, name: string, email: string}[];
  handleUpdate: (payload: Partial<Ticket>) => Promise<void>;
  isAssigning: boolean;
}

export default function TicketDetail({ 
  ticket, 
  agents, 
  handleUpdate, 
  isAssigning
}: TicketDetailProps) {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl ring-1 ring-white/10">
      {/* Header Section */}
      <div className="p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start gap-8 relative z-50">
        <TicketHeader ticket={ticket} />
        <TicketDropdowns ticket={ticket} agents={agents} handleUpdate={handleUpdate} isAssigning={isAssigning} />
      </div>

      {/* Main Content (Body) */}
      <div className="p-8 md:p-10">
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Description</h3>
        <div className="prose prose-invert prose-zinc max-w-none">
          <p 
            className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-[15px]"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ticket.body) }}
          />
        </div>
      </div>
    </div>
  );
}
