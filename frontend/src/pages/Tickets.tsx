import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../lib/auth-client';
import TicketModal from '../components/TicketModal';
import TicketStatusBadge from '../components/TicketStatusBadge';
import { CATEGORY_LABELS, STATUS_LABELS } from '../lib/constants';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type SortingState
} from '@tanstack/react-table';

import type { Ticket } from '../types';

export default function Tickets() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TanStack Table States
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch, statusFilter, categoryFilter, priorityFilter, sorting]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const sortField = sorting.length ? sorting[0].id : 'createdAt';
      const sortOrder = sorting.length && sorting[0].desc ? 'desc' : 'asc';
      
      const url = new URL(`${apiUrl}/api/tickets`);
      url.searchParams.set('sortBy', sortField);
      url.searchParams.set('order', sortOrder);
      url.searchParams.set('page', (pagination.pageIndex + 1).toString());
      url.searchParams.set('limit', pagination.pageSize.toString());
      
      if (debouncedSearch) url.searchParams.set('search', debouncedSearch);
      if (statusFilter !== 'All') url.searchParams.set('status', statusFilter);
      if (categoryFilter !== 'All') url.searchParams.set('category', categoryFilter);
      if (priorityFilter !== 'All') url.searchParams.set('priority', priorityFilter);

      const response = await fetch(url.toString(), {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data.data);
      setTotalCount(data.totalCount);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [pagination.pageIndex, pagination.pageSize, sorting, debouncedSearch, statusFilter, categoryFilter, priorityFilter]);

  const handleCreate = () => {
    setIsModalOpen(true);
  };



  const onSave = () => {
    setIsModalOpen(false);
    fetchTickets();
  };

  const columnHelper = createColumnHelper<Ticket>();

  const columns = [
    columnHelper.accessor('subject', {
      header: 'Subject',
      cell: info => (
        <>
          <Link to={`/tickets/${info.row.original.id}`} className="text-zinc-200 font-semibold hover:text-indigo-400 hover:underline transition-colors block">
            {info.getValue()}
          </Link>
          <div className="text-xs text-zinc-500 mt-1 truncate max-w-xs">{info.row.original.body}</div>
        </>
      ),
    }),
    columnHelper.accessor('customerName', {
      header: 'Customer',
      cell: info => (
        <>
          <div className="text-zinc-300">{info.getValue() || 'Unknown'}</div>
          <div className="text-xs text-zinc-500">{info.row.original.customerEmail}</div>
        </>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <TicketStatusBadge ticket={info.row.original} />
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: info => (
        <span className="text-zinc-400 text-sm font-medium bg-zinc-800/50 px-3 py-1 rounded-lg border border-white/5 whitespace-nowrap">
          {CATEGORY_LABELS[info.getValue()] || info.getValue()}
        </span>
      )
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: info => {
        const priority = info.getValue();
        if (!priority) return <span className="text-zinc-500">-</span>;
        
        let colors = 'text-zinc-400 bg-zinc-800/50 border-white/5';
        if (priority === 'Critical') colors = 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
        else if (priority === 'High') colors = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        else if (priority === 'Medium') colors = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        
        return (
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border whitespace-nowrap ${colors}`}>
            {priority}
          </span>
        );
      }
    }),
    columnHelper.accessor('slaDeadline', {
      header: 'SLA Status',
      cell: info => {
        const deadline = info.getValue();
        const status = info.row.original.status;
        if (!deadline) return <span className="text-zinc-500">-</span>;
        
        if (status === 'Resolved' || status === 'Closed') {
          return <span className="text-emerald-400 text-xs font-semibold">Resolved</span>;
        }

        const msRemaining = new Date(deadline).getTime() - Date.now();
        const hoursRemaining = msRemaining / (1000 * 60 * 60);
        
        if (hoursRemaining < 0) {
          return <span className="text-rose-500 text-xs font-black animate-pulse">BREACHED</span>;
        } else if (hoursRemaining <= 2) {
          return <span className="text-amber-400 text-xs font-bold">Near Breach ({hoursRemaining.toFixed(1)}h)</span>;
        } else {
          return <span className="text-emerald-400 text-xs font-semibold">On Track ({Math.round(hoursRemaining)}h)</span>;
        }
      }
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created At',
      cell: info => (
        <span className="whitespace-nowrap">
          {new Date(info.getValue()).toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
      )
    })
  ];

  const table = useReactTable({
    data: tickets,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      sorting,
      pagination
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true, // Server-side sorting
    manualPagination: true, // Server-side pagination
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 px-8 py-10 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-pink-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 mb-2 drop-shadow-sm">Tickets</h1>
            <p className="text-zinc-400 font-medium tracking-wide">Manage support requests</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchTickets}
              disabled={loading}
              className="group flex items-center justify-center p-2.5 text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh tickets"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
            <button 
              onClick={handleCreate}
              className="group relative px-6 py-2.5 font-bold text-white rounded-lg bg-indigo-500 hover:bg-indigo-400 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] active:scale-95"
            >
              Create Ticket
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-lg">
          <div className="flex-1 w-full relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search subjects or customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-200 placeholder:text-zinc-500"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-zinc-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-200 appearance-none min-w-[140px]"
            >
              <option value="All">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 bg-zinc-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-200 appearance-none min-w-[140px]"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-zinc-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-200 appearance-none min-w-[160px]"
            >
              <option value="All">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-white/5 border-b border-white/5">
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id} 
                        className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-indigo-300/80 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-indigo-200 transition-colors' : ''}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <span className="text-indigo-400 font-bold ml-1">↑</span>,
                            desc: <span className="text-indigo-400 font-bold ml-1">↓</span>,
                          }[header.column.getIsSorted() as string] ?? 
                          (header.column.getCanSort() ? <span className="text-white/20 font-bold ml-1">↕</span> : null)}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse border-b border-white/5 last:border-0">
                      <td className="px-6 py-4">
                        <div className="h-5 w-48 bg-white/10 rounded mb-2"></div>
                        <div className="h-3 w-64 bg-white/10 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-32 bg-white/10 rounded mb-1"></div>
                        <div className="h-3 w-40 bg-white/10 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-20 bg-white/10 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-24 bg-white/10 rounded-lg"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-28 bg-white/10 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 w-16 bg-white/10 rounded-xl ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 font-medium">
                      No tickets found.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="group hover:bg-white/[0.02] transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td 
                          key={cell.id} 
                          className={`px-6 py-4 ${cell.column.id === 'createdAt' ? 'text-sm text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors' : ''}`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-lg">
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>
              Page <span className="font-bold text-white">{table.getState().pagination.pageIndex + 1}</span> of <span className="font-bold text-white">{table.getPageCount() || 1}</span>
            </span>
            <span className="w-px h-4 bg-white/10"></span>
            <span>Total: {totalCount} tickets</span>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
              className="px-3 py-1.5 bg-zinc-950 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-zinc-200 text-sm appearance-none"
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            
            <div className="flex gap-2">
              <button
                className="p-1.5 rounded-lg border border-white/10 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                title="First Page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
              </button>
              <button
                className="p-1.5 rounded-lg border border-white/10 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                title="Previous Page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button
                className="p-1.5 rounded-lg border border-white/10 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                title="Next Page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
              <button
                className="p-1.5 rounded-lg border border-white/10 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                title="Last Page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        </div>

      </div>
      
      {isModalOpen && (
        <TicketModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={onSave} 
        />
      )}
    </div>
  );
}
