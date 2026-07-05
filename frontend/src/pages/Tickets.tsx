import { useState, useEffect } from 'react';
import { useSession } from '../lib/auth-client';
import TicketModal from '../components/TicketModal';

export interface Ticket {
  id: string;
  subject: string;
  body: string;
  status: string;
  category: string;
  customerEmail: string;
  customerName: string | null;
  assignedToId: string | null;
  assignedTo?: { name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export default function Tickets() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + '/api/tickets', {
        headers: {
          // Send credentials for auth
        },
        credentials: 'omit' // actually better-auth uses cookies by default if configured, but let's just rely on auth-client for fetch or standard fetch with credentials: true
      });
      // Wait, we need credentials: 'include' for cross-origin cookies if API is on 5000 and frontend on 5173
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/tickets', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = () => {
    setEditingTicket(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + `/api/tickets/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setTickets(tickets.filter(t => t.id !== id));
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to delete');
      }
    } catch (e: any) {
      alert('Error deleting ticket');
    }
  };

  const onSave = () => {
    setIsModalOpen(false);
    fetchTickets();
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 px-8 py-10 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-pink-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 mb-2 drop-shadow-sm">Tickets</h1>
            <p className="text-zinc-400 font-medium tracking-wide">Manage support requests</p>
          </div>
          <button 
            onClick={handleCreate}
            className="group relative px-6 py-2.5 font-bold text-white rounded-lg bg-indigo-500 hover:bg-indigo-400 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-95"
          >
            Create Ticket
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-300/80">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-300/80">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-300/80">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-300/80">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-300/80 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 font-medium">
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  tickets.map(ticket => (
                    <tr key={ticket.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-zinc-200 font-semibold">{ticket.subject}</div>
                        <div className="text-xs text-zinc-500 mt-1 truncate max-w-xs">{ticket.body}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-300">{ticket.customerName || 'Unknown'}</div>
                        <div className="text-xs text-zinc-500">{ticket.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                          ticket.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          ticket.status === 'Resolved' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-400 text-sm font-medium bg-zinc-800/50 px-3 py-1 rounded-lg border border-white/5">
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(ticket)}
                            className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors hover:underline"
                          >
                            Edit
                          </button>
                          {(session?.user as any)?.role === 'admin' && (
                            <button 
                              onClick={() => handleDelete(ticket.id)}
                              className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <TicketModal 
          ticket={editingTicket} 
          onClose={() => setIsModalOpen(false)} 
          onSave={onSave} 
        />
      )}
    </div>
  );
}
