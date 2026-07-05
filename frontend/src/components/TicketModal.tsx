import { useState, useEffect } from 'react';
import { Ticket } from '../pages/Tickets';

interface TicketModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onSave: () => void;
}

export default function TicketModal({ ticket, onClose, onSave }: TicketModalProps) {
  const isEditing = !!ticket;
  
  const [subject, setSubject] = useState(ticket?.subject || '');
  const [body, setBody] = useState(ticket?.body || '');
  const [customerEmail, setCustomerEmail] = useState(ticket?.customerEmail || '');
  const [customerName, setCustomerName] = useState(ticket?.customerName || '');
  const [status, setStatus] = useState(ticket?.status || 'Open');
  const [category, setCategory] = useState(ticket?.category || 'General Questions');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = import.meta.env.VITE_API_URL + (isEditing ? `/api/tickets/${ticket.id}` : '/api/tickets');
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(
          isEditing 
            ? { status, category } // For edits, we only allow changing status and category for now
            : { subject, body, customerEmail, customerName, category }
        )
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save ticket');
      }

      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Manage Ticket' : 'Create New Ticket'}
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form id="ticket-form" onSubmit={handleSubmit} className="space-y-4">
            
            {!isEditing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Message Body</label>
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Customer Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      required
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {isEditing && (
              <div className="mb-6 p-4 bg-zinc-950 border border-white/5 rounded-xl">
                <h3 className="text-white font-bold mb-1">{ticket.subject}</h3>
                <p className="text-zinc-400 text-sm mb-3">{ticket.body}</p>
                <div className="text-xs text-zinc-500">
                  From: <span className="text-zinc-300">{ticket.customerName || 'Unknown'}</span> ({ticket.customerEmail})
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                >
                  <option value="General Questions">General Questions</option>
                  <option value="Technical Questions">Technical Questions</option>
                  <option value="Refund Request">Refund Request</option>
                </select>
              </div>
              
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-zinc-300 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="ticket-form"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
