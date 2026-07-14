import { useState, useEffect } from 'react';
import { ShieldAlert, TrendingUp, Users, CheckCircle2, Clock, Target, Smile, Frown } from 'lucide-react';

interface AgentReport {
  id: string;
  name: string;
  email: string;
  image: string | null;
  resolvedCount: number;
  openCount: number;
  avgResolutionTimeHours: number;
  slaComplianceRate: number;
}

export default function Reports() {
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/reports/agents`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch reports. Are you an admin?');
        const data = await res.json();
        setReports(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-lg text-center flex flex-col items-center gap-4">
          <ShieldAlert className="w-12 h-12" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Calculate Aggregates
  const totalResolved = reports.reduce((acc, curr) => acc + curr.resolvedCount, 0);
  const totalOpen = reports.reduce((acc, curr) => acc + curr.openCount, 0);
  const avgSla = reports.length > 0 ? reports.reduce((acc, curr) => acc + curr.slaComplianceRate, 0) / reports.length : 0;

  let topAgent = null;
  let bottomAgent = null;
  // Only calculate team insights if there's more than one agent (so it's an admin view with team data)
  if (reports.length > 1) {
    const sorted = [...reports].sort((a, b) => {
      const scoreA = a.resolvedCount * 10 - a.openCount;
      const scoreB = b.resolvedCount * 10 - b.openCount;
      return scoreB - scoreA;
    });
    topAgent = sorted[0].name;
    bottomAgent = sorted[sorted.length - 1].name;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 px-8 py-10 relative overflow-hidden text-white">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 mb-2 drop-shadow-sm">
            Agent Performance Reports
          </h1>
          <p className="text-zinc-400 font-medium text-lg">Admin overview of agent metrics and SLA compliance.</p>
        </div>

        {/* Top Aggregate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-colors">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/20">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-zinc-400 font-semibold">Total Agents</h3>
            </div>
            <div className="text-4xl font-black text-white">{reports.length}</div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-zinc-400 font-semibold">Total Resolved</h3>
            </div>
            <div className="text-4xl font-black text-white">{totalResolved}</div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/20">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-zinc-400 font-semibold">Avg Team SLA</h3>
            </div>
            <div className="text-4xl font-black text-white">{avgSla.toFixed(1)}%</div>
          </div>
        </div>

        {topAgent && bottomAgent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />
              <div>
                <h4 className="text-sm font-bold text-emerald-400 mb-1 flex items-center gap-2 uppercase tracking-widest"><Smile className="w-4 h-4" /> Top Performer</h4>
                <p className="text-2xl font-black text-white">{topAgent}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-emerald-500/50" />
            </div>

            {topAgent !== bottomAgent && (
              <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl" />
                <div>
                  <h4 className="text-sm font-bold text-rose-400 mb-1 flex items-center gap-2 uppercase tracking-widest"><Frown className="w-4 h-4" /> Needs Improvement</h4>
                  <p className="text-2xl font-black text-white">{bottomAgent}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-rose-500/50 rotate-180" />
              </div>
            )}
          </div>
        )}

        {/* Agent Table */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10">
          <div className="px-6 py-5 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Individual Agent Metrics
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/80 border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400">Agent</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-center">Resolved</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-center">Open (WIP)</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-center">Avg Handle Time</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 text-center">SLA Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map((agent) => (
                  <tr key={agent.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {agent.image ? (
                          <img src={agent.image} alt={agent.name} className="w-10 h-10 rounded-full border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg shadow-inner border border-white/10">
                            {agent.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white group-hover:text-orange-400 transition-colors">{agent.name}</div>
                          <div className="text-xs text-zinc-500">{agent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-lg font-bold border border-emerald-500/20 min-w-[3rem]">
                        {agent.resolvedCount}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center bg-amber-500/10 text-amber-400 px-3 py-1 rounded-lg font-bold border border-amber-500/20 min-w-[3rem]">
                        {agent.openCount}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-zinc-300 font-medium">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        {agent.avgResolutionTimeHours.toFixed(1)} hrs
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={`h-full rounded-full ${agent.slaComplianceRate >= 90 ? 'bg-emerald-500' : agent.slaComplianceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${agent.slaComplianceRate}%` }}
                          />
                        </div>
                        <span className={`font-bold text-sm ${agent.slaComplianceRate >= 90 ? 'text-emerald-400' : agent.slaComplianceRate >= 75 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {agent.slaComplianceRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reports.length === 0 && (
              <div className="p-8 text-center text-zinc-500">
                No agent reports available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
