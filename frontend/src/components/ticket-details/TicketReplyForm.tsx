import { useState } from 'react';
import { toast } from 'sonner';

interface TicketReplyFormProps {
  onSubmit: (body: string) => Promise<void>;
  isReplying: boolean;
  customerName?: string | null;
}

export default function TicketReplyForm({ onSubmit, isReplying, customerName }: TicketReplyFormProps) {
  const [replyBody, setReplyBody] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    
    await onSubmit(replyBody);
    setReplyBody('');
  };

  const handlePolish = async () => {
    if (!replyBody.trim()) return;
    setIsPolishing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/ai/polish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: replyBody, customerName })
      });

      if (!response.ok) throw new Error('Failed to polish text');
      
      const data = await response.json();
      setReplyBody(data.polishedText);
      toast.success('Text polished successfully!');
    } catch (err: any) {
      toast.error('Failed to polish text: ' + err.message);
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner border border-white/10">
        You
      </div>
      <div className="flex-1">
        <form onSubmit={handleSubmit}>
          <textarea
            value={replyBody}
            onChange={e => setReplyBody(e.target.value)}
            placeholder="Write a reply..."
            required
            rows={3}
            className="w-full bg-zinc-950/50 border border-white/10 rounded-2xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none shadow-inner"
          />
          <div className="mt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={handlePolish}
              disabled={isPolishing || !replyBody.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-2 border border-indigo-500/20"
            >
              {isPolishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-400/20 border-t-indigo-400 rounded-full animate-spin"></div>
                  Polishing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                  Polish
                </>
              )}
            </button>
            <button
              type="submit"
              disabled={isReplying || !replyBody.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center gap-2"
            >
              {isReplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  Send Reply
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
