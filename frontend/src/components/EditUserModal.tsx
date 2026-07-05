import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, UserPen } from 'lucide-react';
import { authClient } from '../lib/auth-client';

import { editUserSchema, type EditUserInput as FormData } from '@ticketly/core';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
      password: '',
    }
  });

  // Populate form when modal opens with a user
  useEffect(() => {
    if (isOpen && user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role as any,
        password: '', // always empty initially
      });
      setServerError(null);
    }
  }, [isOpen, user, reset]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setServerError(null);

    // Update details (name, email, role)
    const { error: updateError } = await authClient.admin.updateUser({
      userId: user.id,
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
      }
    });

    if (updateError) {
      setServerError(updateError.message || 'Failed to update user');
      return;
    }

    // Set new password if provided
    if (data.password && data.password.trim() !== '') {
      // Use newPassword based on Better Auth admin API docs, but passing both to be safe against SDK variations
      const { error: passError } = await (authClient.admin as any).setUserPassword({
        userId: user.id,
        newPassword: data.password,
        password: data.password
      });

      if (passError) {
        setServerError(passError.message || 'Updated user, but failed to set password');
        return;
      }
    }
    
    reset();
    onSuccess();
  };

  if (!isOpen || !user) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      data-testid="edit-modal-backdrop"
    >
      <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UserPen size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">Edit User</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
              <input
                {...register('name')}
                type="text"
                className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:ring-indigo-500/50 focus:border-indigo-500'}`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:ring-indigo-500/50 focus:border-indigo-500'}`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                New Password <span className="text-zinc-500 font-normal">(Leave blank to keep current)</span>
              </label>
              <input
                {...register('password')}
                type="password"
                className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all ${errors.password ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:ring-indigo-500/50 focus:border-indigo-500'}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Role</label>
              <select
                {...register('role')}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              >
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
