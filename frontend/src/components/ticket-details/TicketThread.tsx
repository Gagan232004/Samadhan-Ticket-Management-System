import type { Ticket } from '../../types';
import DOMPurify from 'dompurify';
import { Paperclip } from 'lucide-react';

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
          <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm shadow-inner border ${reply.senderType === 'CUSTOMER' ? 'bg-slate-100 text-slate-700 border-slate-100' : 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-slate-900 border-slate-200'}`}>
            {reply.senderType === 'CUSTOMER' ? (ticket.customerName || 'U').charAt(0).toUpperCase() : (reply.user ? reply.user.name.charAt(0).toUpperCase() : 'A')}
          </div>
          <div className={`flex-1 rounded-2xl p-5 shadow-sm border ${reply.senderType === 'CUSTOMER' ? 'bg-white border-slate-100' : 'bg-indigo-500/5 border-indigo-500/10'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${reply.senderType === 'CUSTOMER' ? 'text-slate-800' : 'text-indigo-200'}`}>
                  {reply.senderType === 'CUSTOMER' ? (ticket.customerName || 'Unknown Customer') : (reply.user ? reply.user.name : 'Agent')}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${reply.senderType === 'CUSTOMER' ? 'bg-slate-100 text-slate-500 border-zinc-700' : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'}`}>
                  {reply.senderType}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {new Date(reply.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="prose  prose-slate max-w-none">
              <p 
                className={`whitespace-pre-wrap leading-relaxed text-sm ${reply.senderType === 'CUSTOMER' ? 'text-slate-700' : 'text-indigo-100/90'}`}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(reply.bodyHtml || reply.body) }}
              />
            </div>
            
            {reply.attachments && reply.attachments.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <h5 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5" /> Attachments</h5>
                <div className="flex flex-wrap gap-2">
                  {reply.attachments.map((file: any) => (
                    <a key={file.id} href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-50/50 hover:bg-indigo-500/10 text-slate-700 hover:text-indigo-700 text-xs px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-500/30 transition-all shadow-sm">
                      <span className="truncate max-w-[200px] font-medium">{file.filename}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
