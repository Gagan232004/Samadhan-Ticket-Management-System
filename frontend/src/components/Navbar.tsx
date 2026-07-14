import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useSession, signOut } from '../lib/auth-client';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Ticket, Users, Activity } from 'lucide-react';

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
      <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-2xl border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          {session?.user && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-600 hover:text-indigo-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-indigo-50"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <Link to="/" className="text-2xl font-['Outfit'] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] transition-transform drop-shadow-sm">
            Samadhan
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          {isPending ? (
            <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shadow-sm" />
          ) : session?.user ? (
            <>
              <span className="text-indigo-900 font-semibold px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm">
                Hello, {session.user.name}
              </span>
              <button 
                onClick={handleSignOut}
                className="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-5 py-2 rounded-full font-bold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-full font-bold shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 left-0 z-[60] h-full w-72 bg-white border-r border-slate-200 shadow-[20px_0_40px_rgba(0,0,0,0.05)] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Navigation</h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="py-6 flex flex-col gap-2 px-4">
          <Link 
            to="/" 
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-100 border border-transparent rounded-xl transition-all font-semibold"
          >
            <Activity className="w-5 h-5 text-indigo-500" />
            Analytics Dashboard
          </Link>
          <Link 
            to="/tickets" 
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 hover:border-purple-100 border border-transparent rounded-xl transition-all font-semibold"
          >
            <Ticket className="w-5 h-5 text-purple-500" />
            Tickets Management
          </Link>
          <Link 
            to="/reports" 
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-100 border border-transparent rounded-xl transition-all font-semibold"
          >
            <Activity className="w-5 h-5 text-emerald-500" />
            Performance Reports
          </Link>
          {(session?.user as any)?.role === 'admin' && (
            <>
              <Link 
                to="/users" 
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 text-slate-600 hover:text-pink-700 hover:bg-pink-50 hover:border-pink-100 border border-transparent rounded-xl transition-all font-semibold"
              >
                <Users className="w-5 h-5 text-pink-500" />
                Users & Agents
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
