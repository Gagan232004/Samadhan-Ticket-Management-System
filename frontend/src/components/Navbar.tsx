import { Link } from 'react-router-dom';
import { useSession, signOut } from '../lib/auth-client';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

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
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-gradient-to-r from-indigo-950/60 via-purple-900/40 to-zinc-950/80 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-purple-900/20">
      <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:scale-[1.02] transition-transform drop-shadow-sm">
        Ticketly
      </Link>
      
      <div className="flex items-center gap-6">
        {isPending ? (
          <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shadow-lg" />
        ) : session?.user ? (
          <>
            <Link to="/" className="text-white hover:text-indigo-300 font-semibold tracking-wide transition-colors">
              Home
            </Link>
            {(session.user as any).role === 'admin' && (
              <Link to="/users" className="text-white hover:text-indigo-300 font-semibold tracking-wide transition-colors">
                Users
              </Link>
            )}
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
  );
}
