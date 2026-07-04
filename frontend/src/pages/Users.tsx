import { useEffect, useState } from 'react';
import { User, Mail, Calendar, Shield, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const res = await fetch(`${apiUrl}/api/users`, {
          method: 'GET',
          credentials: 'include', // Important to send cookies containing better-auth session
        });
        
        if (!res.ok) {
           if (res.status === 403) throw new Error("Forbidden: You do not have permission to view this.");
           throw new Error("Failed to fetch users");
        }
        
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)] animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2">
            User Management
          </h1>
          <p className="text-zinc-300 text-sm font-medium">
            Manage your team members and customer accounts
          </p>
        </div>
      </div>

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
                <th className="px-6 py-5 rounded-tr-xl"><div className="flex items-center gap-2"><Calendar size={16}/> Joined</div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin w-8 h-8 mx-auto text-indigo-400 mb-4" />
                    <span className="text-zinc-200 font-medium text-lg">Loading users...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-lg shadow-lg">
                      {error}
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-300 font-medium text-lg">
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
