import { useState } from 'react';

interface TicketReplyFormProps {
  onSubmit: (body: string) => Promise<void>;
  isReplying: boolean;
}

export default function TicketReplyForm({ onSubmit, isReplying }: TicketReplyFormProps) {
  const [replyBody, setReplyBody] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    
    await onSubmit(replyBody);
    // Only clear on success, assuming onSubmit throws if it fails.
    // If it doesn't throw, we can just clear it.
    setReplyBody('');
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
          <div className="mt-3 flex justify-end">
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
