import { useEffect, useState } from 'react';
import { Activity, Ticket, CheckCircle2, Clock, Bot, AlertCircle, BrainCircuit, Zap, TrendingUp, Lightbulb, Smile, Frown, Meh } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  aiResolvedTickets: number;
  percentageAiResolved: number;
  avgResolutionTimeMs: number;
  ticketsAnalyzedToday: number;
  aiResolvedToday: number;
  predictedSlaBreaches: number;
  busiestSupportHour: string;
  aiRecommendation: string;
  chartData: any[];
  sentimentData: any[];
  slaNearBreach: number;
  slaBreached: number;
  slaComplianceRate: number;
  categoryPercentages: {
    General_Questions: number;
    Technical_Questions: number;
    Refund_Request: number;
    Others: number;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/tickets/stats/dashboard`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4 text-red-400">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <p className="font-semibold">{error || 'Unable to load dashboard data.'}</p>
      </div>
    );
  }

  const formatDuration = (ms: number) => {
    if (ms === 0) return 'N/A';
    const totalMinutes = Math.floor(ms / 60000);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    
    const totalHours = Math.floor(totalMinutes / 60);
    if (totalHours < 24) {
      const mins = totalMinutes % 60;
      return `${totalHours}h ${mins}m`;
    }
    
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return `${days}d ${hours}h`;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#030712] px-8 py-12 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-fuchsia-600/10 blur-[150px] pointer-events-none mix-blend-screen" />
      <div className="absolute top-[40%] left-[20%] w-[600px] h-[600px] rounded-full bg-teal-600/5 blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.15)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Activity className="w-6 h-6 text-indigo-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 tracking-tight drop-shadow-sm mb-1">
                Analytics Hub
              </h1>
              <p className="text-sm font-medium text-indigo-200/60 tracking-wide">
                SYSTEM METRICS & AI INSIGHTS
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Total Tickets */}
          <div className="group relative bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.15] rounded-3xl p-6 shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-white/10 transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2.5 bg-zinc-800/50 rounded-xl border border-white/5">
                <Ticket className="w-5 h-5 text-zinc-300" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-950/50 px-2.5 py-1 rounded-full border border-white/5">
                Volume
              </span>
            </div>
            <p className="text-4xl font-black text-white mb-1 tracking-tighter drop-shadow-sm relative z-10">{stats.totalTickets}</p>
            <p className="text-sm text-zinc-400 font-medium relative z-10">Total Tickets</p>
          </div>

          {/* Open Tickets */}
          <div className="group relative bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/30 rounded-3xl p-6 shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-amber-500/20 transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Action Required
              </span>
            </div>
            <p className="text-4xl font-black text-white mb-1 tracking-tighter drop-shadow-sm relative z-10">{stats.openTickets}</p>
            <p className="text-sm text-amber-400/80 font-medium relative z-10">Open & Pending</p>
          </div>

          {/* Average Resolution Time */}
          <div className="group relative bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-pink-500/30 rounded-3xl p-6 shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:bg-pink-500/20 transition-colors duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2.5 bg-pink-500/10 rounded-xl border border-pink-500/20">
                <Clock className="w-5 h-5 text-pink-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500/80 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20">
                Performance
              </span>
            </div>
            <p className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-sm relative z-10">{formatDuration(stats.avgResolutionTimeMs)}</p>
            <p className="text-sm text-pink-400/80 font-medium relative z-10">Avg Resolution Time</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-2">General</span>
            <span className="text-3xl font-black text-white">{stats.categoryPercentages?.General_Questions || 0}%</span>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2">Technical</span>
            <span className="text-3xl font-black text-white">{stats.categoryPercentages?.Technical_Questions || 0}%</span>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-2">Refunds</span>
            <span className="text-3xl font-black text-white">{stats.categoryPercentages?.Refund_Request || 0}%</span>
          </div>
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Others</span>
            <span className="text-3xl font-black text-white">{stats.categoryPercentages?.Others || 0}%</span>
          </div>
        </div>

        <div className="mt-6 relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-indigo-500/50 via-purple-500/30 to-fuchsia-500/50 shadow-[0_0_40px_rgba(99,102,241,0.1)] group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative bg-zinc-950/90 backdrop-blur-2xl rounded-3xl p-8 lg:p-10 h-full flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-4">
                <Bot className="w-3.5 h-3.5" /> AI Agent Efficiency
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight leading-tight mb-3">
                Automated Deflection
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed max-w-xl">
                Your AI agent is actively intercepting and resolving customer queries instantly, freeing up human agents for complex issues.
              </p>
            </div>
            
            <div className="flex items-center gap-6 md:gap-12">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                  <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-purple-400 relative z-10">
                    {stats.aiResolvedTickets}
                  </p>
                </div>
                <p className="text-indigo-400/80 text-sm font-bold tracking-wide mt-2">Resolved by AI</p>
              </div>

              <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full"></div>
                  <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-300 to-emerald-400 relative z-10">
                    {stats.percentageAiResolved}<span className="text-2xl">%</span>
                  </p>
                </div>
                <p className="text-teal-400/80 text-sm font-bold tracking-wide mt-2">Deflection Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Command Center & Analytics Grid */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* AI Command Center Sidebar */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col gap-6 xl:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">AI Command Center</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950/50 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Analyzed Today</p>
                <p className="text-2xl font-black text-white">{stats.ticketsAnalyzedToday}</p>
              </div>
              <div className="bg-zinc-950/50 rounded-2xl p-4 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/5 blur-xl"></div>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1 relative z-10">AI Resolved</p>
                <p className="text-2xl font-black text-indigo-300 relative z-10">{stats.aiResolvedToday}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950/50 rounded-2xl p-4 border border-emerald-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 blur-xl"></div>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1 relative z-10">SLA Compliance</p>
                <p className="text-2xl font-black text-emerald-300 relative z-10">{stats.slaComplianceRate}%</p>
              </div>
              <div className="bg-zinc-950/50 rounded-2xl p-4 border border-amber-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/5 blur-xl"></div>
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1 relative z-10">Near Breach</p>
                <p className="text-2xl font-black text-amber-300 relative z-10">{stats.slaNearBreach}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-zinc-950/50 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-300">Predicted SLA Breaches</span>
                </div>
                <span className="text-lg font-black text-amber-500">{stats.predictedSlaBreaches}</span>
              </div>
              
              <div className="bg-zinc-950/50 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-pink-500" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-300">Busiest Hour</span>
                </div>
                <span className="text-sm font-bold text-pink-400">{stats.busiestSupportHour}</span>
              </div>
            </div>

            <div className="mt-auto bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="flex items-start gap-3 relative z-10">
                <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">AI Recommendation</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{stats.aiRecommendation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Area */}
          <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Area Chart - Resolution Trend */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Resolution Trend (7 Days)</h3>
                </div>
                <div className="flex gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2 text-indigo-300"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> AI Resolved</div>
                  <div className="flex items-center gap-2 text-zinc-400"><span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span> Human Resolved</div>
                </div>
              </div>
              <div className="h-64 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHuman" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#52525b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#52525b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                    <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff1a', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="humanResolved" name="Human" stroke="#52525b" strokeWidth={2} fillOpacity={1} fill="url(#colorHuman)" />
                    <Area type="monotone" dataKey="aiResolved" name="AI" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorAi)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart - SLA Status */}
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl flex flex-col lg:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20">
                  <CheckCircle2 className="w-5 h-5 text-fuchsia-400" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">SLA Status Distribution</h3>
              </div>
              <div className="flex-1 flex items-center justify-center -my-4 relative">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#ffffff1a', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text for donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-white">{stats.sentimentData[0].value}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">On Track</span>
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {stats.sentimentData.map(item => (
                  <div key={item.name} className="bg-zinc-950/50 rounded-xl p-3 border border-white/5 flex flex-col items-center text-center">
                    <span className="text-xl font-bold text-white mb-1">{item.value}</span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
