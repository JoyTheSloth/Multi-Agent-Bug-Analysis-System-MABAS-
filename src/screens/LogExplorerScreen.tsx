import { useState, useRef } from 'react';
import { Search, Filter, Copy, Download, Bot, AlertTriangle, Activity, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const LEVEL_STYLES: Record<string, string> = {
  ERROR:   'text-red-400 bg-red-900/20 border-red-500/40',
  WARN:    'text-amber-400 bg-amber-900/20 border-amber-500/40',
  INFO:    'text-emerald-400 bg-emerald-900/20 border-emerald-500/40',
  DEBUG:   'text-slate-400 bg-slate-800/30 border-slate-600/20',
};

function parseLogs(raw: string) {
  return raw
    .split('\n')
    .filter(l => l.trim())
    .map((line, idx) => {
      const errorMatch = line.match(/\b(ERROR|WARN|INFO|DEBUG)\b/);
      const level = errorMatch ? errorMatch[1] : 'DEBUG';
      const timeMatch = line.match(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/);
      return { id: idx + 1, line, level, time: timeMatch?.[0] ?? '', raw: line };
    });
}

export default function LogExplorerScreen() {
  const [rawLogs, setRawLogs] = useState(
    `[INFO] 2024-05-12 14:00:01 Server started on port 8080\n[INFO] 2024-05-12 14:01:05 User 1024 authenticated successfully\n[WARN] 2024-05-12 14:01:44 Redis cache miss for key session:1024\n[ERROR] 2024-05-12 14:02:11 NullReferenceException in PaymentProcessor.Process(). User context is null.\n[ERROR] 2024-05-12 14:02:12 StackTrace:\n  at MobileApp.Payment.Submit() line 82\n  at MobileApp.Checkout.Confirm() line 44\n[WARN] 2024-05-12 14:03:05 Retry attempt 1/3 for payment job 9981\n[ERROR] 2024-05-12 14:03:17 Payment job 9981 failed after 3 retries\n[INFO] 2024-05-12 14:04:01 Background cleanup job finished`
  );
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [aiExplain, setAiExplain] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const logs = parseLogs(rawLogs);

  const filtered = logs.filter(l => {
    const matchLevel = levelFilter === 'ALL' || l.level === levelFilter;
    const matchSearch = !search.trim() || l.line.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const errorCount  = logs.filter(l => l.level === 'ERROR').length;
  const warnCount   = logs.filter(l => l.level === 'WARN').length;
  const infoCount   = logs.filter(l => l.level === 'INFO').length;

  const copyLog = (line: string, id: number) => {
    navigator.clipboard.writeText(line);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1000);
  };

  const downloadLogs = () => {
    const blob = new Blob([rawLogs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'silk-logs.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const runAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const res = await fetch('http://localhost:8000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: rawLogs }),
      });
      if (!res.ok) throw new Error(`Backend error ${res.status}`);
      const data = await res.json();
      setAuditResult(data.analysis);
    } catch {
      setAuditResult('❌ Could not reach backend. Make sure `uv run uvicorn backend.main:app --port 8000` is running.');
    }
    setIsAuditing(false);
  };

  const explainLine = async (log: any) => {
    setSelectedLog(log);
    setAiExplain(null);
    setIsExplaining(true);
    try {
      const res = await fetch('http://localhost:8000/api/explain-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_line: log.line }),
      });
      if (!res.ok) throw new Error('error');
      const data = await res.json();
      setAiExplain(data.explanation);
    } catch {
      setAiExplain('❌ Could not explain. Make sure the backend is running.');
    }
    setIsExplaining(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">🔭 Log Explorer</h1>
          <p className="text-sm text-on-surface-variant mt-1">Paste your logs, filter by level, and use AI to audit or explain any line</p>
        </div>
        <button onClick={downloadLogs} className="flex items-center gap-2 neo-raised px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
          <Download size={16} /> Export Logs
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Errors', count: errorCount, color: 'text-red-500', bg: 'border-red-500/40', filter: 'ERROR' },
          { label: 'Warnings', count: warnCount, color: 'text-amber-500', bg: 'border-amber-500/40', filter: 'WARN' },
          { label: 'Info', count: infoCount, color: 'text-emerald-500', bg: 'border-emerald-500/40', filter: 'INFO' },
        ].map(s => (
          <button key={s.filter} onClick={() => setLevelFilter(levelFilter === s.filter ? 'ALL' : s.filter)}
            className={`neo-raised rounded-xl p-4 text-center transition-all border-l-4 ${s.bg} hover:scale-[1.02] ${levelFilter === s.filter ? 'neo-inset' : ''}`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-on-surface-variant font-semibold mt-1">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left — Log Input + Viewer */}
        <div className="lg:col-span-8 space-y-5">
          {/* Paste raw logs */}
          <div className="neo-raised rounded-2xl p-5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">📋 Paste Logs Here</label>
            <textarea
              value={rawLogs}
              onChange={e => setRawLogs(e.target.value)}
              className="w-full neo-inset rounded-xl p-4 font-mono text-xs text-on-surface bg-surface focus:outline-none min-h-[120px] resize-none"
            />
          </div>

          {/* Search + Filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-48 neo-inset rounded-xl flex items-center px-4 py-2.5 gap-3 bg-surface">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search logs... (e.g. ERROR, PaymentProcessor)"
                className="bg-transparent border-none focus:ring-0 w-full text-sm text-on-surface outline-none"
              />
            </div>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
              className="neo-inset rounded-xl px-4 py-2.5 text-sm text-on-surface bg-surface focus:outline-none font-semibold">
              <option value="ALL">All Levels</option>
              <option value="ERROR">ERROR only</option>
              <option value="WARN">WARN only</option>
              <option value="INFO">INFO only</option>
              <option value="DEBUG">DEBUG only</option>
            </select>
          </div>

          {/* Log Viewer */}
          <div className="neo-raised rounded-2xl bg-surface overflow-hidden">
            <div className="p-3 border-b border-slate-200/50 flex items-center justify-between bg-surface">
              <div className="flex gap-1.5 items-center">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-400 ml-2 uppercase tracking-wide">
                  {filtered.length} / {logs.length} lines
                </span>
              </div>
            </div>
            <div className="bg-slate-900 font-mono text-xs leading-relaxed max-h-[360px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-slate-600">No logs match your filter.</div>
              ) : filtered.map(log => (
                <div
                  key={log.id}
                  onClick={() => explainLine(log)}
                  className={`flex gap-3 px-4 py-2 border-l-2 cursor-pointer hover:bg-white/5 transition-all group ${LEVEL_STYLES[log.level] || LEVEL_STYLES.DEBUG}`}
                >
                  <span className="text-slate-600 select-none w-8 shrink-0 text-right">{log.id}</span>
                  <span className={`shrink-0 font-bold w-12 ${
                    log.level === 'ERROR' ? 'text-red-400' :
                    log.level === 'WARN' ? 'text-amber-400' :
                    log.level === 'INFO' ? 'text-emerald-400' : 'text-slate-500'
                  }`}>{log.level}</span>
                  <span className="text-slate-300 flex-1 break-all">{log.line}</span>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 shrink-0">
                    <button onClick={e => { e.stopPropagation(); copyLog(log.line, log.id); }}
                      className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 hover:text-white text-[10px]">
                      {copiedId === log.id ? '✓' : <Copy size={10} />}
                    </button>
                    <button onClick={e => { e.stopPropagation(); explainLine(log); }}
                      className="px-1.5 py-0.5 rounded bg-indigo-700 text-indigo-200 hover:text-white text-[10px] flex items-center gap-1">
                      <Bot size={10} /> Ask AI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* AI Audit */}
          <div className="neo-raised rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-primary" size={20} />
              <h3 className="font-bold text-sm text-on-surface">🔍 Full System Audit</h3>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">Sarah will analyze all your logs and extract anomalies, risk areas, and patterns.</p>
            <button onClick={runAudit} disabled={isAuditing}
              className="w-full py-3 neo-raised neo-pressed bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:bg-indigo-600">
              {isAuditing
                ? <><RefreshCw size={16} className="animate-spin" /> Auditing...</>
                : <><Bot size={16} /> Run System Audit</>}
            </button>

            <AnimatePresence>
              {auditResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 neo-inset rounded-xl p-4 text-xs prose max-w-none">
                  <ReactMarkdown>{auditResult}</ReactMarkdown>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Explain Log Line */}
          <div className="neo-raised rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bot size={18} className="text-primary" />
              <h3 className="font-bold text-sm text-on-surface">🤖 AI Line Explainer</h3>
            </div>
            {!selectedLog && (
              <div className="flex items-center gap-2 text-xs text-slate-400 neo-inset rounded-xl p-3">
                <ChevronRight size={14} /> Click any log line to get an AI explanation
              </div>
            )}
            {selectedLog && (
              <div>
                <div className="neo-inset rounded-xl p-3 bg-slate-900 font-mono text-[10px] text-slate-300 mb-3 break-all">
                  {selectedLog.line}
                </div>
                {isExplaining ? (
                  <div className="text-xs text-slate-400 animate-pulse flex items-center gap-2">
                    <RefreshCw size={12} className="animate-spin" /> Analyzing with AI...
                  </div>
                ) : aiExplain ? (
                  <div className="prose max-w-none text-xs neo-inset rounded-xl p-4">
                    <ReactMarkdown>{aiExplain}</ReactMarkdown>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
