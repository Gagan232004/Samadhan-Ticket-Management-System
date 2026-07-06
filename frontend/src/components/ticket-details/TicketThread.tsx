import type { Ticket } from '../../types';
import DOMPurify from 'dompurify';

interface TicketThreadProps {
  ticket: Ticket;
}

export default function TicketThread({ ticket }: TicketThreadProps) {
  if (!ticket.replies || ticket.replies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 mb-10">
      {ticket.replies.map((reply: any) => (
        <div key={reply.id} className="flex gap-4">
          <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-inner border ${reply.senderType === 'CUSTOMER' ? 'bg-zinc-800 text-zinc-300 border-white/5' : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white border-white/10'}`}>
            {reply.senderType === 'CUSTOMER' ? (ticket.customerName || 'U').charAt(0).toUpperCase() : (reply.user ? reply.user.name.charAt(0).toUpperCase() : 'A')}
          </div>
          <div className={`flex-1 rounded-2xl p-5 shadow-sm border ${reply.senderType === 'CUSTOMER' ? 'bg-zinc-900/50 border-white/5' : 'bg-indigo-500/5 border-indigo-500/10'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${reply.senderType === 'CUSTOMER' ? 'text-zinc-200' : 'text-indigo-200'}`}>
                  {reply.senderType === 'CUSTOMER' ? (ticket.customerName || 'Unknown Customer') : (reply.user ? reply.user.name : 'Agent')}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${reply.senderType === 'CUSTOMER' ? 'bg-zinc-800 text-zinc-400 border-zinc-700' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                  {reply.senderType}
                </span>
              </div>
              <span className="text-xs text-zinc-500 font-medium">
                {new Date(reply.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="prose prose-invert prose-zinc max-w-none">
              <p 
                className={`whitespace-pre-wrap leading-relaxed text-sm ${reply.senderType === 'CUSTOMER' ? 'text-zinc-300' : 'text-indigo-100/90'}`}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(reply.bodyHtml || reply.body) }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
