import { useState, useEffect } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'

export default function Home() {
  const [count, setCount] = useState(0)
  const [healthMessage, setHealthMessage] = useState<string>('Checking backend status...')

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    fetch(`${apiUrl}/api/health`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => setHealthMessage(data.message))
      .catch(err => {
        if (err.name !== 'AbortError') {
          setHealthMessage('Failed to connect to backend: ' + err.message);
        }
      });

    return () => controller.abort();
  }, [])
  return (
    <div className="flex flex-col min-h-screen text-center bg-slate-50 bg-grid-white relative overflow-hidden">
      {/* Glowing atmospheric orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] opacity-20 pointer-events-none transform-gpu">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-[120px] rounded-full transform -translate-y-1/2" />
      </div>

      <section className="relative z-10 flex flex-col items-center justify-center gap-6 flex-grow py-12 px-5">
        <div className="relative flex justify-center items-center h-48 w-full">
          <img src={heroImg} className="relative z-0 w-44" alt="" />
          <img src={reactLogo} className="absolute z-10 top-8 h-7 transform -rotate-12 scale-125 transition-transform hover:scale-150 duration-300" alt="React logo" />
          <img src={viteLogo} className="absolute z-0 top-24 h-6 transform rotate-12 scale-90 transition-transform hover:scale-110 duration-300" alt="Vite logo" />
        </div>
        
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Get started</h1>
          <p className="p-4 bg-white text-indigo-600 rounded-lg border border-indigo-500 mb-6 max-w-md mx-auto">
            <strong className="text-slate-900">Backend Status:</strong> {healthMessage}
          </p>
          <p className="text-lg text-gray-400">
            Edit <code className="font-mono text-sm bg-white text-gray-200 px-2 py-1 rounded">src/pages/Home.tsx</code> and save to test <code className="font-mono text-sm bg-white text-gray-200 px-2 py-1 rounded">HMR</code>
          </p>
        </div>
        
        <button
          type="button"
          className="mt-6 bg-indigo-500/10 text-indigo-600 border-2 border-transparent hover:border-indigo-500/50 px-6 py-3 rounded-lg font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      {/* Decorative divider line */}
      <div className="w-full h-px bg-slate-200 relative">
        <div className="absolute -top-1 left-0 border-[5px] border-transparent border-l-white/10"></div>
        <div className="absolute -top-1 right-0 border-[5px] border-transparent border-r-white/10"></div>
      </div>

      <section className="flex flex-col md:flex-row text-left max-w-6xl mx-auto w-full">
        <div className="flex-1 p-8 md:p-12 md:border-r border-slate-200 border-b md:border-b-0">
          <svg className="w-6 h-6 mb-4 text-indigo-600" role="presentation" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <h2 className="text-2xl font-semibold mb-2 text-slate-900">Documentation</h2>
          <p className="text-gray-400 mb-8">Your questions, answered</p>
          
          <ul className="flex flex-wrap gap-3">
            <li>
              <a href="https://vite.dev/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white rounded-md hover:bg-slate-100 transition-colors shadow-sm">
                <img className="h-4" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white rounded-md hover:bg-slate-100 transition-colors shadow-sm">
                <img className="h-4" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        
        <div className="flex-1 p-8 md:p-12">
          <svg className="w-6 h-6 mb-4 text-indigo-600" role="presentation" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          <h2 className="text-2xl font-semibold mb-2 text-slate-900">Connect with us</h2>
          <p className="text-gray-400 mb-8">Join the Vite community</p>
          
          <ul className="flex flex-wrap gap-3">
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white rounded-md hover:bg-slate-100 transition-colors shadow-sm">
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white rounded-md hover:bg-slate-100 transition-colors shadow-sm">
                Discord
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Decorative divider line */}
      <div className="w-full h-px bg-slate-200 relative">
        <div className="absolute -top-1 left-0 border-[5px] border-transparent border-l-white/10"></div>
        <div className="absolute -top-1 right-0 border-[5px] border-transparent border-r-white/10"></div>
      </div>
      
      <section className="h-24 md:h-12"></section>
    </div>
  )
}
