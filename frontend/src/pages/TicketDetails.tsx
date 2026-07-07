import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { User } from '@prisma/client';
import type { Ticket } from '../types';
import TicketDetail from '../components/ticket-details/TicketDetail';
import TicketThread from '../components/ticket-details/TicketThread';
import TicketReplyForm from '../components/ticket-details/TicketReplyForm';
import { toast } from 'sonner';
import { useSession } from '../lib/auth-client';

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agents, setAgents] = useState<Pick<User, 'id' | 'name' | 'email'>[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        const [ticketRes, agentsRes] = await Promise.all([
          fetch(`${apiUrl}/api/tickets/${id}`, { credentials: 'include' }),
          fetch(`${apiUrl}/api/users/agents`, { credentials: 'include' })
        ]);
        
        if (!ticketRes.ok) {
          if (ticketRes.status === 404) throw new Error('Ticket not found');
          throw new Error('Failed to fetch ticket details');
        }
        
        const ticketData = await ticketRes.json();
        setTicket(ticketData);

        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();
          setAgents(agentsData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdate = async (payload: Partial<Ticket>) => {
    setIsAssigning(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update ticket');
      
      const updatedTicket = await response.json();
      setTicket(updatedTicket);
      
      let message = 'Ticket updated successfully';
      let shouldToast = false;
      const isAdmin = (session?.user as any)?.role === 'admin';

      if ('assignedToId' in payload) {
        const assignedName = agents.find(a => a.id === payload.assignedToId)?.name || 'Unassigned';
        message = `Ticket assigned to ${assignedName}`;
        if (isAdmin) shouldToast = true;
      } else if ('status' in payload) {
        message = `Ticket status changed to ${payload.status}`;
        shouldToast = true; // Both admin and agent get status change toast
      } else if ('category' in payload) {
        message = `Ticket category changed to ${payload.category}`;
        shouldToast = true; 
      }
      
      if (shouldToast) {
        toast.success(message, {
          className: 'bg-white/95 backdrop-blur-3xl border border-green-100 text-green-950 font-bold shadow-[0_8px_30px_rgb(0,0,0,0.08)] !px-6 !py-4 rounded-2xl'
        });
      }

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReplySubmit = async (body: string) => {
    setIsReplying(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/tickets/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body, senderType: 'AGENT' })
      });

      if (!response.ok) throw new Error('Failed to submit reply');
      
      const newReply = await response.json();
      setTicket(prev => prev ? {
        ...prev,
        replies: [...(prev.replies || []), newReply]
      } : null);
    } catch (err: any) {
      alert(err.message);
      throw err; // throw so the form doesn't clear if it fails
    } finally {
      setIsReplying(false);
    }
  };

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

        <TicketDetail 
          ticket={ticket} 
          agents={agents} 
          handleUpdate={handleUpdate} 
          isAssigning={isAssigning} 
        />

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl ring-1 ring-white/10 mt-6 p-8 md:p-10">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Thread ({ticket.replies?.length || 0})
          </h3>
          
          <TicketThread ticket={ticket} />
          <TicketReplyForm onSubmit={handleReplySubmit} isReplying={isReplying} customerName={ticket.customerName} />
        </div>
      </div>
    </div>
  );
}
