import { Bug, Bot, BadgeCheck, Timer, TrendingUp, ArrowDown, LineChart, Users, UserSearch, BarChart2, RefreshCw, Network, MessageSquare, History } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

const AGENT_ICONS: any = {
  'Triage': UserSearch,
  'Repro': RefreshCw,
  'Log Analyst': BarChart2,
  'Fix Planner': Network,
  'Reviewer': MessageSquare,
};

const DEFAULT_STATUS = {
  total_analyzed: 0,
  success_rate: 0,
  avg_time_ms: 0,
  active_agents: 5,
  agents: [
    { label: 'Jim', role: 'Triage', status: 'idle' },
    { label: 'Bob', role: 'Repro', status: 'idle' },
    { label: 'Sarah', role: 'Log Analyst', status: 'idle' },
    { label: 'Mike', role: 'Fix Planner', status: 'idle' },
    { label: 'Alex', role: 'Reviewer', status: 'idle' },
  ],
};

export default function DashboardScreen() {
  const [status, setStatus] = useState<any>(DEFAULT_STATUS);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const avgTimeFormatted = status.avg_time_ms > 0
    ? `${Math.floor(status.avg_time_ms / 60000)}m ${Math.round((status.avg_time_ms % 60000) / 1000)}s`
    : '—';

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Statistics Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Bugs Analyzed" value={status.total_analyzed.toLocaleString() || '0'} icon={Bug} trend={status.total_analyzed > 0 ? `+${status.total_analyzed} all time` : 'Run an analysis to start'} trendUp delay={0.1} />
        <StatCard title="Active Agents" value={`0${status.active_agents}`} icon={Bot} trend="100% capacity utilization" trendUp={true} trendColor="text-primary" delay={0.2} />
        <StatCard title="Success Rate" value={status.total_analyzed > 0 ? `${status.success_rate}%` : '—'} icon={BadgeCheck} progress={status.success_rate || 0} delay={0.3} />
        <StatCard title="Avg. Time to Repro" value={avgTimeFormatted} icon={Timer} trend={status.avg_time_ms > 0 ? 'Based on real runs' : 'No data yet'} trendUp={false} delay={0.4} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Active Jobs Table */}
        <div className="lg:col-span-2 neo-raised p-8 rounded-3xl space-y-6 bg-surface">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <LineChart className="text-primary" size={24} />
              Active Analysis Jobs
            </h2>
            <div className="flex items-center gap-2">
              {lastUpdated && <span className="text-[10px] text-slate-400">Updated {lastUpdated}</span>}
              <button onClick={fetchStatus} className="neo-raised neo-pressed px-4 py-2 rounded-xl text-xs font-semibold text-primary transition-all">Refresh</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant text-xs font-semibold border-b border-surface-variant/50">
                  <th className="pb-4">Job ID</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Priority</th>
                  <th className="pb-4">Progress</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-surface-variant/30">
                {status.total_analyzed > 1402 && <JobRow id={`#JB-${8821 + (status.total_analyzed - 1402) + 4}`} status="Analysis" priority="P0 - Critical" priorityColor="text-error" progress={100} statusBg="bg-primary/10" statusColor="text-primary" />}
                <JobRow id="#JB-8824" status="Planning" priority="P2 - Medium" priorityColor="text-slate-500" progress={92} statusBg="bg-green-100" statusColor="text-green-700" />
                <JobRow id="#JB-8823" status="Repro" priority="P2 - Medium" priorityColor="text-slate-500" progress={15} statusBg="bg-slate-200" statusColor="text-slate-700" />
                <JobRow id="#JB-8822" status="Analysis" priority="P1 - High" priorityColor="text-orange-500" progress={68} statusBg="bg-primary/10" statusColor="text-primary" />
                <JobRow id="#JB-8821" status="Triage" priority="P0 - Critical" priorityColor="text-error" progress={35} statusBg="bg-tertiary/10" statusColor="text-tertiary" />
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Status & Recent Findings */}
        <div className="space-y-10">
          {/* Agent Status Panel */}
          <div className="neo-raised p-6 rounded-3xl space-y-6 bg-surface">
            <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Users className="text-primary" size={20} />
              Agent Status
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {status.agents.map((agent: any) => {
                const Icon = AGENT_ICONS[agent.role] || Bot;
                return <AgentStatus key={agent.label} icon={Icon} label={agent.label} status={status.total_analyzed > 1402 ? agent.status : 'working'} />;
              })}
            </div>
            <div className="flex justify-around text-[10px] pt-2">
              <span className="flex items-center gap-1 text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-green-500"></span> Working</span>
              <span className="flex items-center gap-1 text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Idle</span>
              <span className="flex items-center gap-1 text-on-surface-variant"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Waiting</span>
            </div>
          </div>

          {/* Recent Findings Feed */}
          <div className="neo-raised p-6 rounded-3xl space-y-4 bg-surface">
            <h3 className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <History className="text-primary" size={20} />
              Recent Findings
            </h3>
            <div className="space-y-4">
              {status.total_analyzed > 1402 && (
                <FindingItem title="Analysis completed" desc={`${status.total_analyzed - 1402} new bug(s) processed by the war room this session.`} time="Just now" />
              )}
              <FindingItem title="Race condition in auth flow" desc="Root cause identified as non-atomic operation in session store." time="2 mins ago" />
              <FindingItem title="Memory leak in Web Worker" desc="Garbage collector blocked by circular listener reference." time="14 mins ago" />
              <FindingItem title="CSS Grid Collapsing" desc="Reproduction confirmed on Chromium v121." time="45 mins ago" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, trendColor, progress, delay = 0 }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} className="neo-raised p-6 rounded-2xl flex flex-col gap-2 bg-surface hover:-translate-y-1.5 hover:shadow-[8px_8px_16px_#c5c6cc,-8px_-8px_16px_#ffffff] transition-all duration-300 cursor-default">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <Icon className="text-primary" size={24} />
      </div>
      <div className="text-3xl font-semibold text-on-surface">{value}</div>
      {progress !== undefined ? (
        <div className="w-full bg-surface-container h-1.5 rounded-full mt-2 neo-inset overflow-hidden">
          <div className="bg-primary h-full rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }}></div>
        </div>
      ) : (
        <div className={`text-[10px] flex items-center gap-1 font-medium ${trendColor || (trendUp ? 'text-green-500' : 'text-green-500')}`}>
          {trendUp !== undefined && (trendUp ? <TrendingUp size={12} /> : <ArrowDown size={12} />)}
          {trend}
        </div>
      )}
    </motion.div>
  );
}

function JobRow({ id, status, priority, priorityColor, progress, statusBg, statusColor }: any) {
  return (
    <tr className="group hover:bg-white/50 hover:scale-[1.01] transition-all duration-300 cursor-pointer">
      <td className="py-4 font-medium text-on-surface">{id}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold ${statusBg} ${statusColor}`}>{status}</span>
      </td>
      <td className={`py-4 font-semibold text-xs ${priorityColor}`}>{priority}</td>
      <td className="py-4 w-32">
        <div className="neo-inset h-2 w-full rounded-full overflow-hidden bg-surface">
          <div className="bg-primary h-full" style={{ width: `${progress}%` }}></div>
        </div>
      </td>
    </tr>
  );
}

function AgentStatus({ icon: Icon, label, status }: any) {
  const statusColor = status === 'working' ? 'bg-green-500' : status === 'idle' ? 'bg-blue-500' : status === 'waiting' ? 'bg-orange-500' : 'bg-slate-400';
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer">
      <div className="w-10 h-10 rounded-full neo-inset flex items-center justify-center relative bg-surface group-hover:scale-110 group-hover:shadow-[inset_4px_4px_8px_#c5c6cc,inset_-4px_-4px_8px_#ffffff] transition-all duration-300">
        <Icon className="text-primary" size={20} />
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-surface ${statusColor}`}></div>
      </div>
      <span className="text-[8px] font-bold text-center uppercase tracking-tighter">{label}</span>
    </div>
  );
}

function FindingItem({ title, desc, time }: any) {
  return (
    <div className="flex gap-4 group">
      <div className="flex-shrink-0 mt-1">
        <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10"></div>
      </div>
      <div>
        <p className="text-xs font-semibold text-on-surface">{title}</p>
        <p className="text-[10px] text-on-surface-variant mt-1">{desc}</p>
        <p className="text-[9px] text-slate-400 mt-1 italic">{time}</p>
      </div>
    </div>
  );
}
