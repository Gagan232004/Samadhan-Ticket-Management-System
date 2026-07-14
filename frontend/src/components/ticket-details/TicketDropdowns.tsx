import { useState, useEffect, useRef } from 'react';
import type { Ticket } from '../../types';
import TicketStatusBadge from '../TicketStatusBadge';
import { CATEGORY_LABELS, STATUS_LABELS } from '../../lib/constants';
import type { User } from '@prisma/client';

interface TicketDropdownsProps {
  ticket: Ticket;
  agents: Pick<User, 'id' | 'name' | 'email'>[];
  handleUpdate: (payload: Partial<Ticket>) => Promise<void>;
  isAssigning: boolean;
}

export default function TicketDropdowns({ ticket, agents, handleUpdate, isAssigning }: TicketDropdownsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 relative">
      {/* Status Dropdown */}
      <div className="relative" ref={statusRef}>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Status</div>
        <button 
          onClick={() => setIsStatusOpen(!isStatusOpen)}
          disabled={isAssigning}
          className="w-full px-3 py-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 text-sm flex justify-between items-center transition-all hover:bg-slate-50 hover:border-indigo-500/50 group disabled:opacity-50 shadow-lg"
        >
          <TicketStatusBadge ticket={ticket} />
          <div className="text-slate-400 shrink-0 group-hover:text-indigo-600 transition-colors">
            {isAssigning ? (
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className={`w-4 h-4 transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            )}
          </div>
        </button>
        {isStatusOpen && (
          <div className="absolute top-[calc(100%+8px)] right-0 w-full bg-white backdrop-blur-3xl border border-slate-200 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.6)] overflow-hidden z-50 ring-1 ring-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-1 flex flex-col custom-scrollbar">
              {Object.keys(STATUS_LABELS).map(status => (
                <button
                  key={status}
                  onClick={() => {
                    handleUpdate({ status: status as any });
                    setIsStatusOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center transition-all ${ticket.status === status ? 'bg-indigo-500/10 text-indigo-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  {STATUS_LABELS[status] || status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="relative" ref={categoryRef}>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Category</div>
        <button 
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          disabled={isAssigning}
          className="w-full px-3 py-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 text-sm flex justify-between items-center transition-all hover:bg-slate-50 hover:border-indigo-500/50 group disabled:opacity-50 shadow-lg"
        >
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-100">
            {CATEGORY_LABELS[ticket.category] || ticket.category}
          </span>
          <div className="text-slate-400 shrink-0 group-hover:text-indigo-600 transition-colors">
            {isAssigning ? (
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className={`w-4 h-4 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            )}
          </div>
        </button>
        {isCategoryOpen && (
          <div className="absolute top-[calc(100%+8px)] right-0 w-full bg-white backdrop-blur-3xl border border-slate-200 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.6)] overflow-hidden z-50 ring-1 ring-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-1 flex flex-col max-h-60 overflow-y-auto custom-scrollbar">
              {Object.keys(CATEGORY_LABELS).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    handleUpdate({ category: cat as any });
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center transition-all ${ticket.category === cat ? 'bg-indigo-500/10 text-indigo-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assigned To Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Assigned To</div>
        <button
          onClick={() => !isAssigning && setIsDropdownOpen(!isDropdownOpen)}
          disabled={isAssigning}
          className="w-full px-3 py-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 text-sm flex justify-between items-center transition-all hover:bg-slate-50 hover:border-indigo-500/50 group disabled:opacity-50 shadow-lg"
        >
          <div className="flex items-center gap-2.5 truncate pr-2">
            <div className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-extrabold text-slate-900 shadow-inner border border-slate-200">
              {ticket.assignedTo ? ticket.assignedTo.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="flex flex-col items-start truncate">
              <span className="font-semibold tracking-wide text-xs truncate w-full">{ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}</span>
            </div>
          </div>
          
          <div className="text-slate-400 shrink-0 group-hover:text-indigo-600 transition-colors">
            {isAssigning ? (
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            )}
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute top-[calc(100%+8px)] right-0 w-full bg-white backdrop-blur-3xl border border-slate-200 rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.6)] overflow-hidden z-50 ring-1 ring-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
              <button
                onClick={() => {
                  handleUpdate({ assignedToId: null as any });
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-all ${!ticket.assignedToId ? 'bg-indigo-500/10 text-indigo-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
              >
                <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-inner border ${!ticket.assignedToId ? 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30' : 'bg-slate-100 text-slate-400 border-slate-100'}`}>
                  ?
                </div>
                <span className="font-semibold text-xs">Unassigned</span>
              </button>
              
              {agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => {
                    handleUpdate({ assignedToId: agent.id });
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-all mt-1 ${ticket.assignedToId === agent.id ? 'bg-indigo-500/10 text-indigo-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                >
                  <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-inner border ${ticket.assignedToId === agent.id ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-slate-900 border-slate-200' : 'bg-slate-100 text-slate-700 border-slate-100 group-hover:bg-zinc-700'}`}>
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-xs truncate">{agent.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
