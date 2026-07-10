import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface SimilarTicket {
  id: string;
  subject: string;
  status: string;
  category: string;
  resolution_notes: string;
  distance: number;
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
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl ring-1 ring-white/10 animate-pulse">
        <div className="h-5 bg-white/10 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-16 bg-white/5 rounded-xl w-full"></div>
          <div className="h-16 bg-white/5 rounded-xl w-full"></div>
          <div className="h-16 bg-white/5 rounded-xl w-full"></div>
        </div>
      </div>
    );
  }

  if (error || similarTickets.length === 0) {
    return null; // Don't show if there's an error or no similar tickets found
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl ring-1 ring-white/10">
      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        Similar Resolved Tickets
      </h3>
      
      <div className="space-y-4">
        {similarTickets.map((st) => (
          <div key={st.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
            <Link to={`/tickets/${st.id}`} className="font-medium text-white hover:text-indigo-400 transition-colors line-clamp-1">
              {st.subject}
            </Link>
            {st.resolution_notes && (
              <p className="text-sm text-zinc-400 mt-2 line-clamp-2 italic">
                "{st.resolution_notes}"
              </p>
            )}
            <div className="flex items-center gap-2 mt-3 text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-md w-max">
              Match: {((1 - st.distance) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
