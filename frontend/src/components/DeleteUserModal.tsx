import { useState, useEffect } from 'react';
import { X, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import axios from 'axios';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export function DeleteUserModal({ isOpen, onClose, onSuccess, user }: DeleteUserModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setServerError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  const handleDelete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    setServerError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.delete(`${apiUrl}/api/users/${user.id}`, {
        withCredentials: true,
      });
      onSuccess();
    } catch (err: any) {
      setServerError(err.response?.data?.error || err.message || 'Failed to delete user');
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      data-testid="delete-modal-backdrop"
    >
      <div className="bg-zinc-900 border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Delete User</h2>
                <p className="text-sm text-zinc-400 mt-1">This action cannot be undone.</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5">
            <p className="text-zinc-300">
              Are you sure you want to delete <span className="text-white font-bold">{user.name}</span> (<span className="text-zinc-400">{user.email}</span>)? 
              They will permanently lose access to the system.
            </p>
          </div>

          {serverError && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-medium">
              {serverError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red-500/25"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Trash2 size={18} />
                  Yes, Delete User
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
