import { useState } from 'react';
import type { Ticket } from '../../types';
import DOMPurify from 'dompurify';
import TicketHeader from './TicketHeader';
import TicketDropdowns from './TicketDropdowns';
import { toast } from 'sonner';
import type { User } from '@prisma/client';
import { Paperclip } from 'lucide-react';

interface TicketDetailProps {
  ticket: Ticket;
  agents: Pick<User, 'id' | 'name' | 'email'>[];
  handleUpdate: (payload: Partial<Ticket>) => Promise<void>;
  isAssigning: boolean;
}

export default function TicketDetail({ 
  ticket, 
  agents, 
  handleUpdate, 
  isAssigning
}: TicketDetailProps) {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ticketData: ticket })
      });

      if (!response.ok) throw new Error('Failed to summarize ticket');
      
      const data = await response.json();
      setSummary(data.summary);
      toast.success('Summary generated successfully!');
    } catch (err: any) {
      toast.error('Failed to summarize ticket: ' + err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="bg-white backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl ring-1 ring-slate-100">
      {/* Header Section */}
      <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-8 relative z-50">
        <TicketHeader ticket={ticket} />
        <TicketDropdowns ticket={ticket} agents={agents} handleUpdate={handleUpdate} isAssigning={isAssigning} />
      </div>

      {/* Main Content (Body) */}
      <div className="p-8 md:p-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Description</h3>
        <div className="prose  prose-slate max-w-none mb-6">
          <p 
            className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px]"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ticket.body) }}
          />
        </div>
        
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mb-6 pt-3 border-t border-slate-100">
            <h5 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5" /> Attachments</h5>
            <div className="flex flex-wrap gap-2">
              {ticket.attachments.map((file: any) => (
                <a key={file.id} href={`http://localhost:5000${file.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-50/50 hover:bg-indigo-500/10 text-slate-700 hover:text-indigo-700 text-xs px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-500/30 transition-all shadow-sm">
                  <span className="truncate max-w-[200px] font-medium">{file.filename}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {summary && (
          <div className="mb-6 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl relative shadow-inner">
             <h4 className="text-indigo-600 font-bold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                AI Summary
             </h4>
             <div className="text-slate-800 text-[15px] whitespace-pre-wrap leading-relaxed">
               {summary}
             </div>
          </div>
        )}

        <button
          onClick={handleSummarize}
          disabled={isSummarizing}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-50 transition-all flex items-center gap-2 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
        >
          {isSummarizing ? (
            <>
              <div className="w-4 h-4 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
              Summarizing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              {summary ? 'Regenerate Summary' : 'Summarize Ticket'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
