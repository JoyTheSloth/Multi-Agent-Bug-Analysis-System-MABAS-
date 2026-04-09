import { useState, useRef, useEffect } from 'react';
import { PlayCircle, CheckCircle, Bug, Terminal, AlertTriangle, Copy, Download, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const DEFAULT_BUG = `When I try to checkout on the mobile app, it crashes midway. I suspect it's a null pointer because of missing user context, but I can't confirm.`;
const DEFAULT_LOGS = `[ERROR] 2024-05-12 14:02:11 NullReferenceException in PaymentProcessor.Process(). User context is null.
StackTrace:
  at MobileApp.Payment.Submit() line 82
  at MobileApp.Checkout.Confirm() line 44`;

export default function AnalysisTraceScreen() {
  const [bugReport, setBugReport] = useState(DEFAULT_BUG);
  const [logs, setLogs] = useState(DEFAULT_LOGS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [traces, setTraces] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    triage: true, rootcause: true, repro: true, patch: true, validation: true, json: false
  });
  const traceRef = useRef<HTMLDivElement>(null);

  // Auto-scroll traces terminal
  useEffect(() => {
    if (traceRef.current) {
      traceRef.current.scrollTop = traceRef.current.scrollHeight;
    }
  }, [traces]);

  const toggleSection = (key: string) =>
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const downloadJson = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'silk-analysis-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setTraces([]);
    setResult(null);
    setErrorDetails(null);
    setBugReport(DEFAULT_BUG);
    setLogs(DEFAULT_LOGS);
  };

  const startAnalysis = async () => {
    if (!bugReport.trim() || !logs.trim()) return;
    setIsAnalyzing(true);
    setTraces(['[System] 🚀 Connecting to backend...', '[System] 📦 Sending bug report and logs...']);
    setResult(null);
    setErrorDetails(null);

    try {
      const res = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bug_report: bugReport, logs: logs }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Backend error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      setTraces(data.trace_logs?.length ? data.trace_logs : ['[System] ✅ Analysis complete.']);
      setResult({
        bug_summary: data.bug_summary,
        evidence: data.evidence,
        repro: data.repro,
        root_cause: data.root_cause,
        patch_plan: data.patch_plan,
        validation_plan: data.validation_plan,
      });
    } catch (e: any) {
      const msg = e.message || 'Unknown error';
      setErrorDetails(msg);
      setTraces(prev => [...prev, `[Error] ❌ ${msg}`]);
    }

    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-24">
      {/* Input Panel */}
      <div className="bg-surface neo-raised rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-on-surface">
            <Bug className="text-primary" size={22} /> New Deep Analysis
          </h2>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-error transition-colors neo-raised px-3 py-2 rounded-lg"
          >
            <Trash2 size={14} /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">🐛 Bug Report</label>
            <textarea
              value={bugReport}
              onChange={e => setBugReport(e.target.value)}
              className="w-full neo-inset rounded-xl p-4 bg-surface text-sm text-on-surface focus:outline-none min-h-[140px] resize-none leading-relaxed"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">📋 Logs / Evidence</label>
            <textarea
              value={logs}
              onChange={e => setLogs(e.target.value)}
              className="w-full neo-inset rounded-xl p-4 bg-surface text-sm text-on-surface font-mono focus:outline-none min-h-[140px] resize-none"
            />
          </div>
        </div>

        <button
          onClick={startAnalysis}
          disabled={isAnalyzing}
          className="mt-5 w-full py-4 text-sm font-bold bg-primary text-white rounded-xl neo-raised hover:bg-indigo-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <><RefreshCw size={18} className="animate-spin" /> Running Agentic Workflow — please wait...</>
          ) : (
            <><PlayCircle size={18} /> 🚀 Launch Full Agentic Analysis</>
          )}
        </button>
      </div>

      {/* Trace Terminal */}
      <AnimatePresence>
        {traces.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface neo-raised rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-on-surface">
                <Terminal size={14} /> 🖥️ Agent Trace Logs
                {isAnalyzing && <span className="text-primary animate-pulse ml-2">● LIVE</span>}
              </h3>
              <button
                onClick={() => copyToClipboard(traces.join('\n'))}
                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-primary neo-raised px-2 py-1 rounded-lg font-semibold transition-colors"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <div ref={traceRef} className="bg-slate-900 neo-inset rounded-xl p-4 font-mono text-xs max-h-56 overflow-y-auto space-y-1.5">
              {traces.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-primary shrink-0 opacity-60">&gt;</span>
                  <span className={
                    t.includes('[Error]') ? 'text-red-400' :
                    t.includes('[Bob]') ? 'text-amber-300' :
                    t.includes('[Jim]') ? 'text-indigo-300' :
                    t.includes('[Sarah]') ? 'text-cyan-300' :
                    t.includes('[Mike]') ? 'text-emerald-300' :
                    t.includes('[Alex]') ? 'text-purple-300' : 'text-slate-400'
                  }>{t}</span>
                </div>
              ))}
              {isAnalyzing && (
                <div className="flex gap-2 animate-pulse">
                  <span className="text-primary opacity-60">&gt;</span>
                  <span className="text-slate-600">processing...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner */}
      {errorDetails && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-xl neo-inset">
          <p className="font-bold flex items-center gap-2 text-red-500 text-sm"><AlertTriangle size={16} /> Analysis Failed</p>
          <p className="text-xs mt-1 text-red-400 font-mono">{errorDetails}</p>
          <p className="text-xs mt-2 text-slate-500">Make sure the backend is running: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">uv run uvicorn backend.main:app --port 8000</code></p>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {/* Triage */}
            <ResultCard
              icon="🚨" title="Triage Summary" color="border-primary/50"
              expanded={expandedSections.triage}
              onToggle={() => toggleSection('triage')}
              onCopy={() => copyToClipboard(result.bug_summary.summary)}
            >
              <div className="prose max-w-none text-sm leading-relaxed text-on-surface">
                <ReactMarkdown>{result.bug_summary.summary}</ReactMarkdown>
              </div>
            </ResultCard>

            {/* Root Cause */}
            <ResultCard
              icon="🔍" title="Root Cause Analysis" color="border-cyan-500/50"
              expanded={expandedSections.rootcause}
              onToggle={() => toggleSection('rootcause')}
              onCopy={() => copyToClipboard(result.root_cause.details)}
            >
              <div className="prose max-w-none text-sm leading-relaxed text-on-surface">
                <ReactMarkdown>{result.root_cause.details}</ReactMarkdown>
              </div>
            </ResultCard>

            {/* Raw JSON */}
            <ResultCard
              icon="📦" title="Raw JSON Payload" color="border-slate-500/30"
              expanded={expandedSections.json}
              onToggle={() => toggleSection('json')}
              onCopy={() => copyToClipboard(JSON.stringify(result, null, 2))}
              extra={
                <button
                  onClick={() => downloadJson(result)}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-primary neo-raised px-2 py-1 rounded-lg font-semibold transition-colors"
                >
                  <Download size={12} /> Export
                </button>
              }
            >
              <div className="bg-slate-900 p-3 rounded-xl text-xs font-mono text-indigo-200 overflow-x-auto">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </ResultCard>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            {/* Repro Script */}
            <ResultCard
              icon={result.repro.reproduced ? '💥' : '✅'} 
              title={`Repro Script — ${result.repro.reproduced ? 'BUG REPRODUCED' : 'No crash'}`}
              color={result.repro.reproduced ? 'border-red-500/50' : 'border-emerald-500/50'}
              expanded={expandedSections.repro}
              onToggle={() => toggleSection('repro')}
              onCopy={() => copyToClipboard(result.repro.code)}
            >
              <div className="bg-slate-900 p-4 rounded-xl font-mono text-xs text-sky-200 overflow-x-auto mb-3">
                <pre>{result.repro.code}</pre>
              </div>
              {result.repro.stderr && (
                <div>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1.5">❌ stderr output</p>
                  <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-3 font-mono text-xs text-red-400 overflow-x-auto">
                    <pre>{result.repro.stderr}</pre>
                  </div>
                </div>
              )}
              {result.repro.stdout && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5">stdout</p>
                  <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-3 font-mono text-xs text-emerald-300 overflow-x-auto">
                    <pre>{result.repro.stdout}</pre>
                  </div>
                </div>
              )}
            </ResultCard>

            {/* Patch Plan */}
            <ResultCard
              icon="🛠️" title="Patch Plan" color="border-primary/40"
              expanded={expandedSections.patch}
              onToggle={() => toggleSection('patch')}
              onCopy={() => copyToClipboard(result.patch_plan.steps)}
            >
              <div className="prose max-w-none text-sm leading-relaxed text-on-surface">
                <ReactMarkdown>{result.patch_plan.steps}</ReactMarkdown>
              </div>
            </ResultCard>

            {/* Validation */}
            <ResultCard
              icon="✅" title="Validation Plan" color="border-emerald-500/40"
              expanded={expandedSections.validation}
              onToggle={() => toggleSection('validation')}
              onCopy={() => copyToClipboard(result.validation_plan.join('\n'))}
            >
              <div className="prose max-w-none text-sm leading-relaxed text-on-surface">
                <ReactMarkdown>{result.validation_plan.join('\n\n')}</ReactMarkdown>
              </div>
            </ResultCard>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ResultCard({ icon, title, color, expanded, onToggle, onCopy, extra, children }: any) {
  return (
    <div className={`bg-surface neo-raised rounded-2xl overflow-hidden border-l-4 ${color}`}>
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={onToggle}>
        <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {extra}
          <button
            onClick={onCopy}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-primary neo-raised px-2 py-1 rounded-lg font-semibold transition-colors"
          >
            <Copy size={12} /> Copy
          </button>
          <button onClick={onToggle} className="text-slate-400 hover:text-primary transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
