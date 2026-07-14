import { User, Mail, Calendar, Shield, CheckCircle2, XCircle, Plus, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { DeleteUserModal } from '../components/DeleteUserModal';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function Users() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);

  const { data: users = [], isLoading: loading, error } = useQuery<UserData[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await axios.get(`${apiUrl}/api/users`, {
          withCredentials: true,
        });
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 403) {
          throw new Error("Forbidden: You do not have permission to view this.");
        }
        throw new Error(err.response?.data?.error || err.message || 'An error occurred while fetching users');
      }
    }
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-zinc-950">
      {/* Premium Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative flex flex-col p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2">
            User Management
          </h1>
          <p className="text-zinc-300 text-sm font-medium">
            Manage your team members and customer accounts
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Create User
        </button>
      </div>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }}
      />

      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={() => {
          setEditingUser(null);
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }}
      />

      <DeleteUserModal
        isOpen={!!deletingUser}
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onSuccess={() => {
          setDeletingUser(null);
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }}
      />
      <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/20 rounded-2xl p-1 overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none" />
        
        <div className="overflow-x-auto relative z-10 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/20 bg-black/40 text-sm uppercase tracking-wider text-zinc-100 font-bold">
                <th className="px-6 py-5 rounded-tl-xl"><div className="flex items-center gap-2"><User size={16}/> User</div></th>
                <th className="px-6 py-5"><div className="flex items-center gap-2"><Mail size={16}/> Email</div></th>
                <th className="px-6 py-5"><div className="flex items-center gap-2"><Shield size={16}/> Role</div></th>
                <th className="px-6 py-5"><div className="flex items-center gap-2"><CheckCircle2 size={16}/> Status</div></th>
                <th className="px-6 py-5"><div className="flex items-center gap-2"><Calendar size={16}/> Joined</div></th>
                <th className="px-6 py-5 rounded-tr-xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse border-b border-white/5 last:border-0">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10"></div>
                        <div className="h-5 w-32 bg-white/10 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-48 bg-white/10 rounded"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-6 w-16 bg-white/10 rounded-full"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-white/10"></div>
                        <div className="h-4 w-20 bg-white/10 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-28 bg-white/10 rounded"></div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-8 w-8 bg-white/10 rounded-xl ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-lg shadow-lg">
                      {error.message}
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-300 font-medium text-lg">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr 
                    key={user.id} 
                    className="group hover:bg-white/[0.05] transition-colors duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-black/50 group-hover:scale-110 transition-transform duration-300">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-semibold text-zinc-100 group-hover:text-white transition-colors text-base">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-zinc-300 font-medium group-hover:text-zinc-100 transition-colors text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
                        user.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/20'
                          : user.role === 'agent'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-blue-500/20' 
                          : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {user.emailVerified ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-sm">
                          <CheckCircle2 size={16} /> Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-400 font-medium text-sm">
                          <XCircle size={16} /> Unverified
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-sm text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-indigo-400 transition-colors"
                          title="Edit User"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => setDeletingUser(user)}
                          disabled={user.role === 'admin'}
                          className={`p-2 rounded-xl transition-colors ${
                            user.role === 'admin' 
                              ? 'text-zinc-600 cursor-not-allowed' 
                              : 'text-zinc-400 hover:bg-red-500/20 hover:text-red-400'
                          }`}
                          title={user.role === 'admin' ? "Admins cannot be deleted" : "Delete User"}
                        >
                          <Trash2 size={18} />
                        </button>
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
    </div>
  );
}
