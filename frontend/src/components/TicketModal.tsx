import { useState, useRef } from 'react';
import type { Ticket } from '../types';
import { CATEGORY_LABELS } from '../lib/constants';
import { Paperclip, X } from 'lucide-react';

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
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const ticket = await response.json();

      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append('ticketId', ticket.id);
        attachments.forEach(file => formData.append('files', file));

        const uploadRes = await fetch(`${apiUrl}/api/uploads`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload some attachments');
        }
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
        className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-slate-900">
            Create New Ticket
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form id="ticket-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-500 mb-1">Subject</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-slate-500 mb-1">Message Body</label>
              <textarea
                id="body"
                value={body}
                onChange={e => setBody(e.target.value)}
                required
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-slate-500 mb-1">Customer Name</label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-slate-500 mb-1">Customer Email</label>
                <input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Attachments</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setAttachments([...attachments, ...Array.from(e.target.files)]);
                    }
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all"
                >
                  <Paperclip className="w-4 h-4" />
                  Attach Files
                </button>
              </div>
              
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-indigo-500/10 text-indigo-700 text-xs px-3 py-1.5 rounded-lg border border-indigo-500/20">
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button type="button" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="hover:text-slate-900 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="ticket-form"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-900 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            {loading ? 'Saving...' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
