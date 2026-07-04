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
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textDecoration: 'none',
        color: '#fff',
        background: 'linear-gradient(90deg, #646cff, #a64d79)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Ticketly
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {isPending ? (
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #646cff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        ) : session?.user ? (
          <>
            <span style={{ color: '#e0e0e0', fontWeight: 500 }}>
              Hello, {session.user.name}
            </span>
            <button 
              onClick={handleSignOut}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/login" style={{
            backgroundColor: '#646cff',
            color: 'white',
            textDecoration: 'none',
            padding: '0.5rem 1.25rem',
            borderRadius: '6px',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#535bf2'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#646cff'}
          >
            Login
          </Link>
        )}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </nav>
  );
}
