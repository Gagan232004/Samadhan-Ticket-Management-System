import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useSession, signOut } from '../lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, Ticket, Users, Activity } from 'lucide-react';

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate('/login');
        },
      },
    });
  };

  return (
    <>
      <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-gradient-to-r from-indigo-950/60 via-purple-900/40 to-zinc-950/80 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-purple-900/20">
        <div className="flex items-center gap-4">
          {session?.user && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-white hover:text-indigo-400 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <Link to="/" className="text-2xl font-['Outfit'] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:scale-[1.02] transition-transform drop-shadow-sm">
            Samadhan
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          {isPending ? (
            <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shadow-lg" />
          ) : session?.user ? (
            <>
              <span className="text-indigo-50 font-semibold px-4 py-1.5 rounded-full bg-white/10 border border-white/20 shadow-inner">
                Hello, {session.user.name}
              </span>
              <button 
                onClick={handleSignOut}
                className="bg-red-500/90 hover:bg-red-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 left-0 z-[60] h-full w-72 bg-zinc-950 border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10 bg-zinc-900/50">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Navigation</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="py-6 flex flex-col gap-2 px-4">
          <Link 
            to="/" 
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-zinc-300 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/50 border border-transparent rounded-xl transition-all font-semibold"
          >
            <Activity className="w-5 h-5 text-emerald-400" />
            Analytics Dashboard
          </Link>
          <Link 
            to="/tickets" 
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-zinc-300 hover:text-white hover:bg-teal-500/20 hover:border-teal-500/50 border border-transparent rounded-xl transition-all font-semibold"
          >
            <Ticket className="w-5 h-5 text-teal-400" />
            Tickets Management
          </Link>
          <Link 
            to="/reports" 
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-zinc-300 hover:text-white hover:bg-orange-500/20 hover:border-orange-500/50 border border-transparent rounded-xl transition-all font-semibold"
          >
            <Activity className="w-5 h-5 text-orange-400" />
            Performance Reports
          </Link>
          {(session?.user as any)?.role === 'admin' && (
            <>
              <Link 
                to="/users" 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-zinc-300 hover:text-white hover:bg-pink-500/20 hover:border-pink-500/50 border border-transparent rounded-xl transition-all font-semibold"
              >
                <Users className="w-5 h-5 text-pink-400" />
                Users & Agents
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
