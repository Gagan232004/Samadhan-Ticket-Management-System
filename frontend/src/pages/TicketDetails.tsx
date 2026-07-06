import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Ticket } from './Tickets';
import TicketStatusBadge from '../components/TicketStatusBadge';

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/tickets/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Ticket not found');
          }
          throw new Error('Failed to fetch ticket details');
        }
        
        const data = await response.json();
        setTicket(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-500 font-medium tracking-wide">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-zinc-950 flex flex-col items-center justify-center p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Oops!</h2>
          <p className="text-red-300 mb-6">{error || 'Something went wrong.'}</p>
          <button 
            onClick={() => navigate('/tickets')}
            className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors border border-white/5"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 px-4 py-10 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-pink-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Link 
          to="/tickets" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-indigo-400 font-medium mb-8 transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Tickets
        </Link>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10">
          {/* Header Section */}
          <div className="p-8 md:p-10 border-b border-white/5">
            <div className="flex flex-wrap gap-3 mb-6">
              <TicketStatusBadge status={ticket.status} />
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-zinc-800/50 text-zinc-300 border border-white/5">
                {ticket.category.replace(/_/g, ' ')}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-4 leading-tight">
              {ticket.subject}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
              <span>ID: <span className="text-zinc-400 font-mono">{ticket.id.slice(0, 8)}</span></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800"></span>
              <span>Opened {new Date(ticket.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Content & Sidebar Grid */}
          <div className="flex flex-col md:flex-row">
            {/* Main Content (Body) */}
            <div className="flex-1 p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/5">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Description</h3>
              <div className="prose prose-invert prose-zinc max-w-none">
                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed text-[15px]">
                  {ticket.body}
                </p>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="w-full md:w-72 bg-black/20 p-8 md:p-10 space-y-8">
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  Customer Info
                </h3>
                <div className="text-zinc-200 font-medium text-sm mb-1">{ticket.customerName || 'Unknown Customer'}</div>
                <div className="text-zinc-500 text-sm truncate" title={ticket.customerEmail}>{ticket.customerEmail}</div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  Assigned To
                </h3>
                {ticket.assignedTo ? (
                  <>
                    <div className="text-indigo-300 font-medium text-sm mb-1">{ticket.assignedTo.name}</div>
                    <div className="text-zinc-500 text-sm truncate" title={ticket.assignedTo.email}>{ticket.assignedTo.email}</div>
                  </>
                ) : (
                  <div className="text-zinc-500 text-sm italic">Unassigned</div>
                )}
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Last Updated
                </h3>
                <div className="text-zinc-400 text-sm">
                  {new Date(ticket.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
