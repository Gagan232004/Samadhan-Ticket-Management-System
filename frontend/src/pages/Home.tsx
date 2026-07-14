import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useSession } from '../lib/auth-client';
import { Navigate } from 'react-router-dom';

export default function Home() {
  const { data: session, isPending } = useSession();

  if (!isPending && session?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden bg-zinc-950 bg-grid-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[40rem] w-[40rem] animate-pulse rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute h-[30rem] w-[30rem] animate-pulse rounded-full bg-purple-600/20 blur-[100px] mix-blend-screen" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Animated Badge */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300 backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            Next-Gen Ticket Management
          </span>
        </div>

        {/* Main Title Animation */}
        <h1 className="animate-in zoom-in-50 duration-700 ease-out fill-mode-both text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]">
          Samadhan
        </h1>

        {/* Quote Animation */}
        <p className="mt-6 max-w-[600px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both text-lg md:text-2xl font-medium text-zinc-400">
          "Simplifying complexity. Resolving issues faster. Empowering your support team to deliver excellence."
        </p>

        {/* Call to Action Button */}
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
          <Link
            to="/login"
            className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 font-bold text-zinc-950 transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2 text-lg">
              Get Started 
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </div>
  );
}
