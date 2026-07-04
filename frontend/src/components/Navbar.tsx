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
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/5 backdrop-blur-md border-b border-white/10">
      <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-90 transition-opacity">
        Ticketly
      </Link>
      
      <div className="flex items-center gap-6">
        {isPending ? (
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        ) : session?.user ? (
          <>
            {(session.user as any).role === 'admin' && (
              <Link to="/users" className="text-gray-300 hover:text-white font-medium transition-colors">
                Users
              </Link>
            )}
            <span className="text-gray-200 font-medium">
              Hello, {session.user.name}
            </span>
            <button 
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold transition-colors duration-200"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link 
            to="/login" 
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-md font-semibold transition-colors duration-200"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
