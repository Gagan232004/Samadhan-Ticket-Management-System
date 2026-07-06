import { useState, useEffect } from 'react';
import type { Ticket } from '../pages/Tickets';
import { CATEGORY_LABELS } from '../lib/constants';

interface TicketModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function TicketModal({ onClose, onSave }: TicketModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [category, setCategory] = useState('General_Questions');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const url = apiUrl + '/api/tickets';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject, body, customerEmail, customerName, category })
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
      <div 
        role="dialog" 
        aria-modal="true"
        className="relative bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white">
            Create New Ticket
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
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-zinc-400 mb-1">Subject</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-zinc-400 mb-1">Message Body</label>
              <textarea
                id="body"
                value={body}
                onChange={e => setBody(e.target.value)}
                required
                rows={4}
                className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-zinc-400 mb-1">Customer Name</label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-zinc-400 mb-1">Customer Email</label>
                <input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
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
            {loading ? 'Saving...' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
