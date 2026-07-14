import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface SimilarTicket {
  id: string;
  subject: string;
  status: string;
  category: string;
  resolution_notes: string;
  distance: number;
  last_agent_reply?: string;
  resolved_by?: string;
}

interface SimilarTicketsProps {
  ticketId: string;
}

export default function SimilarTickets({ ticketId }: SimilarTicketsProps) {
  const [similarTickets, setSimilarTickets] = useState<SimilarTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSimilarTickets = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/tickets/${ticketId}/similar`, { credentials: 'include' });
        
        if (!res.ok) throw new Error('Failed to fetch similar tickets');
        
        const data = await res.json();
        setSimilarTickets(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarTickets();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="bg-white backdrop-blur-xl border border-slate-100 rounded-3xl p-6 shadow-2xl ring-1 ring-slate-100 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-16 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-16 bg-slate-100 rounded-xl w-full"></div>
          <div className="h-16 bg-slate-100 rounded-xl w-full"></div>
        </div>
      </div>
    );
  }

  if (error || similarTickets.length === 0) {
    return null; // Don't show if there's an error or no similar tickets found
  }

  return (
    <div className="bg-white backdrop-blur-xl border border-slate-100 rounded-3xl p-6 shadow-2xl ring-1 ring-slate-100">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        Similar Resolved Tickets
      </h3>
      
      <div className="space-y-4">
        {similarTickets.map((st) => (
          <div key={st.id} className="bg-slate-100 border border-slate-200 rounded-xl p-4 hover:bg-slate-200 transition-colors">
            <Link to={`/tickets/${st.id}`} className="font-medium text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
              {st.subject}
            </Link>
            {st.last_agent_reply ? (
              <div className="mt-3 bg-white rounded-lg p-3 border border-slate-100">
                <p className="text-xs font-semibold text-indigo-600 mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Solution by {st.resolved_by || 'Agent'}
                </p>
                <p className="text-sm text-slate-700 line-clamp-3">
                  {st.last_agent_reply}
                </p>
              </div>
            ) : st.resolution_notes ? (
              <p className="text-sm text-slate-500 mt-2 line-clamp-2 italic">
                "{st.resolution_notes}"
              </p>
            ) : null}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-700 bg-indigo-500/10 px-2 py-1 rounded-md w-max">
                Match: {((1 - st.distance) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
