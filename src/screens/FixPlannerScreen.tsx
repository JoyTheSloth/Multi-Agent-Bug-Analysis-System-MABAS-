import { useState } from 'react';
import { Terminal, RefreshCw, CheckCircle, Code, PlayCircle, GitBranch, Brain, BarChart, AlertTriangle, Sparkles, RotateCcw, History, ChevronDown, Columns, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

// ---------- types ----------
interface PatchVersion {
  id: string;
  timestamp: string;
  hypothesis: string;
  strategy: string;
  details: string;
  files: string[];
  rollback: string[];
  testing: string[];
  patchText: string;
  reviewText: string;
  confidence: number;
  riskScore: number;
}

// ---------- helpers ----------
function extractSection(text: string, keywords: string[]): string {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (keywords.some(k => lines[i].toLowerCase().includes(k.toLowerCase()))) {
      const snippet = lines.slice(i + 1, i + 4).join(' ').replace(/^[-*•\s]+/, '').trim();
      if (snippet) return snippet;
    }
  }
  // fallback — first non-empty line
  return lines.find(l => l.trim().length > 10)?.replace(/^[#\-*•\s]+/, '').trim() ?? '—';
}

function extractFiles(text: string): string[] {
  const matches = text.match(/\b[\w/.-]+\.(py|ts|tsx|js|jsx|java|go|rb|cs)\b/g);
  return matches ? [...new Set(matches)].slice(0, 4) : ['(see patch plan below)'];
}

function extractBullets(text: string, sectionKeywords: string[]): string[] {
  const lines = text.split('\n');
  let inSection = false;
  const bullets: string[] = [];
  for (const line of lines) {
    if (sectionKeywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) { inSection = true; continue; }
    if (inSection && /^[-*•\d]/.test(line.trim())) {
      const clean = line.replace(/^[-*•\d.\s]+/, '').trim();
      if (clean) bullets.push(clean);
    }
    if (inSection && bullets.length >= 3) break;
  }
  return bullets.length ? bullets : ['See detailed plan below'];
}

let versionCounter = 1;

export default function FixPlannerScreen() {
  const [rootCause, setRootCause] = useState('NullReferenceException in PaymentProcessor.Process(). User context is null when checkout is triggered on mobile app. StackTrace points to MobileApp.Payment.Submit() line 82.');
  const [logs, setLogs] = useState('[ERROR] 14:02:11 NullReferenceException in PaymentProcessor.Process(). User context is null.\n[ERROR] 14:02:12 at MobileApp.Payment.Submit() line 82\n[WARN] 14:03:05 Retry attempt 1/3 for payment job 9981');
  const [showInput, setShowInput] = useState(true);

  const [versions, setVersions] = useState<PatchVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState('');
  const [compareVersionId, setCompareVersionId] = useState('');
  const [isComparing, setIsComparing] = useState(false);

  const [isPlanning, setIsPlanning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeVersion = versions.find(v => v.id === activeVersionId) ?? null;
  const compareVersion = versions.find(v => v.id === compareVersionId) ?? null;

  const runPlan = async () => {
    setIsPlanning(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/plan-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ root_cause: rootCause, logs }),
      });
      if (!res.ok) throw new Error(`Backend error ${res.status}`);
      const data = await res.json();
      const plan: string = data.patch_plan;
      const confidence: number = data.confidence_score ?? 82;

      const newVersion: PatchVersion = {
        id: `v1.0.${versionCounter}-rc`,
        timestamp: 'Just now',
        hypothesis: extractSection(plan, ['objective', 'fix objective', 'goal', 'cause']),
        strategy: extractSection(plan, ['strategy', 'approach', 'solution', 'step 1']),
        details: `Confidence: ${confidence}%`,
        files: extractFiles(plan),
        rollback: extractBullets(plan, ['rollback', 'revert', 'undo']),
        testing: extractBullets(plan, ['test', 'validat', 'verify', 'unit test']),
        patchText: plan,
        reviewText: '',
        confidence,
        riskScore: 0,
      };
      versionCounter++;
      setVersions(prev => [newVersion, ...prev]);
      setActiveVersionId(newVersion.id);
      setShowInput(false);
    } catch (e: any) {
      setError(e.message || 'Backend unreachable. Run: uv run uvicorn backend.main:app --port 8000');
    }
    setIsPlanning(false);
  };

  const runReview = async () => {
    if (!activeVersion) return;
    setIsReviewing(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/review-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patch_plan: activeVersion.patchText, root_cause: rootCause }),
      });
      if (!res.ok) throw new Error(`Backend error ${res.status}`);
      const data = await res.json();
      setVersions(prev => prev.map(v =>
        v.id === activeVersion.id
          ? { ...v, reviewText: data.review, riskScore: data.risk_score ?? 15 }
          : v
      ));
    } catch (e: any) {
      setError(e.message || 'Backend unreachable.');
    }
    setIsReviewing(false);
  };

  const downloadReport = () => {
    if (!activeVersion) return;
    const txt = `=== SILK ANALYSIS FIX REPORT ===\n\nROOT CAUSE:\n${rootCause}\n\nPATCH PLAN (${activeVersion.id}):\n${activeVersion.patchText}\n\nREVIEW:\n${activeVersion.reviewText}`;
    const blob = new Blob([txt], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `silk-fix-${activeVersion.id}.txt`;
    a.click();
  };

  const renderVersionDetails = (version: PatchVersion, isCompare = false, other: PatchVersion | null = null) => (
    <div className="space-y-4 flex-1">
      {isComparing && (
        <div className={`text-[10px] font-bold px-2 py-1 rounded inline-block mb-2 uppercase tracking-wider ${isCompare ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
          {isCompare ? 'Comparison Target' : 'Active Version'}
        </div>
      )}
      <div className="neo-inset p-4 rounded-xl bg-surface">
        <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Root Cause Hypothesis</span>
        <p className="text-on-surface text-sm leading-relaxed">{version.hypothesis}</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="neo-inset p-4 rounded-xl bg-surface">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Impacted Files</span>
          <ul className="text-xs font-mono space-y-1 mt-2 text-on-surface-variant">
            {version.files.map((file, idx) => (
              <li key={idx} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full" /> {file}</li>
            ))}
          </ul>
        </div>
        <div className="neo-inset p-4 rounded-xl bg-surface">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">Strategy</span>
          <p className="text-sm font-medium mt-2 text-on-surface">{version.strategy}</p>
          <p className="text-[10px] text-on-surface-variant">{version.details}</p>
        </div>
      </div>
      <div className="neo-inset p-4 rounded-xl bg-surface">
        <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <CheckCircle size={14} /> Validation & Testing
        </span>
        <ul className="text-xs text-on-surface-variant space-y-1.5 font-medium">
          {version.testing.map((test, idx) => {
            const isDiff = isComparing && other && other.testing[idx] !== test;
            return (
              <li key={idx} className={`flex items-start gap-2 transition-colors ${isDiff ? 'bg-emerald-500/10 text-emerald-600 p-1.5 rounded -ml-1.5' : ''}`}>
                <span className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5 shrink-0" />{test}
              </li>
            );
          })}
        </ul>
      </div>
      <div className={`neo-inset p-4 rounded-xl bg-surface border-l-2 border-amber-500/50`}>
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <RotateCcw size={14} /> Rollback Plan
        </span>
        <ol className="text-xs text-on-surface-variant space-y-2 list-decimal list-inside font-medium">
          {version.rollback.map((step, idx) => {
            const isDiff = isComparing && other && other.rollback[idx] !== step;
            return (
              <li key={idx} className={`transition-colors ${isDiff ? 'bg-amber-500/10 text-amber-600 p-1.5 rounded -ml-1.5' : ''}`}>{step}</li>
            );
          })}
        </ol>
      </div>
    </div>
  );

  const renderDiff = (version: PatchVersion, isCompare = false) => (
    <div className={`neo-inset rounded-xl p-4 font-mono text-sm overflow-x-auto bg-slate-900 text-slate-300 flex-1 ${isCompare ? 'border border-amber-500/30' : ''}`}>
      <div className="text-slate-500 mb-2 border-b border-slate-800 pb-2 flex justify-between items-center">
        <span>{version.id} — patch plan</span>
        {isComparing && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCompare ? 'bg-amber-500/20 text-amber-400' : 'bg-primary/20 text-indigo-300'}`}>{isCompare ? 'Compare' : 'Active'}</span>}
      </div>
      <div className="prose max-w-none text-xs text-slate-300 [&_*]:text-slate-300 [&_code]:bg-slate-800 [&_code]:px-1 [&_code]:rounded">
        <ReactMarkdown>{version.patchText}</ReactMarkdown>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Fix Planner & Review</h2>
          <p className="text-on-surface-variant mt-1">
            {activeVersion
              ? <>Active patch: <span className="font-mono text-xs bg-surface-container px-2 py-0.5 rounded">{activeVersion.id}</span></>
              : 'Generate a patch plan and have Alex review it.'}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setShowInput(s => !s)}
            className="neo-raised neo-pressed px-5 py-2.5 rounded-xl font-semibold text-on-surface-variant flex items-center gap-2 transition-all bg-surface hover:text-primary hover:scale-[1.02]">
            <Terminal size={18} /> {showInput ? 'Hide Input' : 'New Analysis'}
          </button>
          {activeVersion && (
            <button onClick={downloadReport}
              className="neo-raised neo-pressed px-5 py-2.5 rounded-xl font-semibold text-on-surface-variant flex items-center gap-2 transition-all bg-surface hover:text-primary hover:scale-[1.02]">
              <Download size={18} /> Export Report
            </button>
          )}
          <button onClick={runReview} disabled={isReviewing || !activeVersion}
            className="neo-raised neo-pressed px-5 py-2.5 rounded-xl font-semibold bg-primary text-white flex items-center gap-2 transition-all hover:scale-[1.02] hover:bg-indigo-500 disabled:opacity-50">
            {isReviewing ? <><RefreshCw size={18} className="animate-spin" /> Reviewing...</> : <><CheckCircle size={18} /> Ask Alex to Review</>}
          </button>
        </div>
      </div>

      {/* Input Panel */}
      <AnimatePresence>
        {showInput && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="neo-raised rounded-2xl p-6 space-y-4 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">🔍 Root Cause</label>
                <textarea value={rootCause} onChange={e => setRootCause(e.target.value)}
                  className="w-full neo-inset rounded-xl p-4 text-sm text-on-surface bg-surface focus:outline-none min-h-[100px] resize-none leading-relaxed" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">📋 Logs</label>
                <textarea value={logs} onChange={e => setLogs(e.target.value)}
                  className="w-full neo-inset rounded-xl p-4 font-mono text-xs text-on-surface bg-surface focus:outline-none min-h-[100px] resize-none" />
              </div>
            </div>
            <button onClick={runPlan} disabled={isPlanning}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl neo-raised hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
              {isPlanning ? <><RefreshCw size={18} className="animate-spin" /> Mike is generating patch plan...</> : <><GitBranch size={18} /> 🛠️ Generate Patch Plan (Mike)</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-xl">
          <p className="font-bold text-red-500 text-sm flex items-center gap-2"><AlertTriangle size={16}/> Error</p>
          <p className="text-xs mt-1 text-red-400 font-mono">{error}</p>
        </div>
      )}

      {/* No versions yet */}
      {versions.length === 0 && !isPlanning && (
        <div className="text-center py-16 text-slate-400">
          <GitBranch size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No patch plans yet.</p>
          <p className="text-sm mt-1">Fill in the root cause above and click "Generate Patch Plan".</p>
        </div>
      )}

      {versions.length > 0 && activeVersion && (
        <div className="grid grid-cols-12 gap-8">
          {/* Final Output Summary */}
          <div className="col-span-12 neo-raised rounded-2xl p-6 bg-surface">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface flex items-center gap-2">
                <Code className="text-primary" size={20} /> Final Output Summary
              </h3>
              <span className="text-xs font-mono text-on-surface-variant">
                {activeVersion.reviewText
                  ? (activeVersion.riskScore < 30 ? 'status: APPROVED' : activeVersion.riskScore < 60 ? 'status: NEEDS_REVIEW' : 'status: REJECTED')
                  : 'status: READY_FOR_REVIEW'}
              </span>
            </div>
            <div className="neo-inset rounded-xl p-6 font-mono text-sm overflow-x-auto bg-surface/50 text-indigo-900/80 leading-relaxed">
              <pre><code>{JSON.stringify({
                version_id: activeVersion.id,
                hypothesis: activeVersion.hypothesis.slice(0, 80) + '...',
                strategy: activeVersion.strategy.slice(0, 60) + '...',
                confidence_score: activeVersion.confidence / 100,
                risk_score: activeVersion.riskScore / 100,
                files_affected: activeVersion.files.length,
                status: activeVersion.reviewText ? 'REVIEWED' : 'PENDING_REVIEW',
              }, null, 2)}</code></pre>
            </div>
          </div>

          {/* Reproduction Script (shows root cause as evidence) */}
          <div className={`col-span-12 ${isComparing ? '' : 'lg:col-span-5'} neo-raised rounded-2xl p-6 bg-surface transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface flex items-center gap-2">
                <PlayCircle className="text-emerald-500" size={20} /> Evidence & Logs
              </h3>
              <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold neo-inset">
                <CheckCircle size={14} /> CAPTURED
              </div>
            </div>
            <div className="neo-inset rounded-xl p-4 mb-4 font-mono text-xs bg-slate-900 text-slate-300">
              <div className="text-slate-500 border-b border-slate-800 pb-2 mb-2">root_cause_input</div>
              <p className="text-amber-300">{rootCause}</p>
            </div>
            <div className="neo-inset rounded-xl p-4 font-mono text-xs bg-slate-900 text-slate-300 max-h-36 overflow-y-auto">
              <div className="text-slate-500 border-b border-slate-800 pb-2 mb-2">logs</div>
              <pre className="whitespace-pre-wrap text-slate-300">{logs}</pre>
            </div>
          </div>

          {/* Patch Plan */}
          <div className={`col-span-12 ${isComparing ? '' : 'lg:col-span-7'} neo-raised rounded-2xl p-6 bg-surface transition-all`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-semibold text-on-surface flex items-center gap-2">
                <GitBranch className="text-primary" size={20} /> Patch Plan
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 neo-inset bg-surface rounded-lg px-3 py-1.5 relative">
                  <History size={16} className="text-primary" />
                  <select className="bg-transparent text-xs font-bold text-on-surface outline-none appearance-none cursor-pointer pr-6 w-36"
                    value={activeVersionId} onChange={e => setActiveVersionId(e.target.value)}>
                    {versions.map(v => (
                      <option key={v.id} value={v.id} className="bg-surface">{v.id} ({v.timestamp})</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="text-slate-400 absolute right-3 pointer-events-none" />
                </div>
                <button onClick={() => setIsComparing(!isComparing)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isComparing ? 'bg-primary text-white neo-pressed' : 'neo-raised text-primary hover:bg-surface-container'}`}
                  disabled={versions.length < 2}>
                  <Columns size={14} /> Compare
                </button>
                {isComparing && (
                  <>
                    <span className="text-slate-400 text-xs font-bold px-1">vs</span>
                    <div className="flex items-center gap-2 neo-inset bg-surface rounded-lg px-3 py-1.5 relative border border-amber-500/30">
                      <History size={16} className="text-amber-500" />
                      <select className="bg-transparent text-xs font-bold text-on-surface outline-none appearance-none cursor-pointer pr-6 w-36"
                        value={compareVersionId} onChange={e => setCompareVersionId(e.target.value)}>
                        {versions.map(v => (
                          <option key={v.id} value={v.id} className="bg-surface">{v.id} ({v.timestamp})</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="text-slate-400 absolute right-3 pointer-events-none" />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className={`flex flex-col ${isComparing ? 'lg:flex-row gap-6' : 'gap-4'}`}>
              {renderVersionDetails(activeVersion, false, compareVersion)}
              {isComparing && compareVersion && renderVersionDetails(compareVersion, true, activeVersion)}
            </div>
          </div>

          {/* Critic Review — Alex */}
          <div className="col-span-12 neo-raised rounded-2xl p-0 bg-surface overflow-hidden">
            <div className="flex items-center gap-4 p-6 border-b border-surface-container">
              <div className="w-12 h-12 rounded-2xl neo-raised bg-surface-container flex items-center justify-center text-2xl">🕵️</div>
              <div>
                <h4 className="font-bold text-on-surface">Alex — Reviewer Agent <span className="font-normal text-on-surface-variant ml-2 text-sm">v3.21-beta</span></h4>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-full font-bold">SECURITY ENFORCER</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">REASONING ENGINE</span>
                </div>
              </div>
            </div>
            <div className="p-8 grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-surface p-6 neo-inset rounded-2xl relative">
                  {activeVersion.reviewText ? (
                    <div className="prose max-w-none text-sm leading-relaxed text-on-surface">
                      <ReactMarkdown>{activeVersion.reviewText}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm italic text-on-surface-variant leading-loose">
                      {isReviewing ? '🔍 Alex is reviewing the patch plan...' : 'Click "Ask Alex to Review" to get a full critique of this patch plan.'}
                    </p>
                  )}
                  <button onClick={runReview} disabled={isReviewing}
                    className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg neo-raised hover:bg-indigo-600 disabled:opacity-50 flex items-center gap-2 transition-all">
                    <RefreshCw size={14} className={isReviewing ? 'animate-spin' : ''} />
                    {isReviewing ? 'Reviewing with Groq...' : 'Ask Alex to Review'}
                  </button>
                </div>
                {activeVersion.reviewText && (
                  <div className="flex gap-4">
                    <div className="neo-raised p-4 rounded-xl flex-grow bg-surface">
                      <div className="flex items-center gap-2 mb-2 text-error">
                        <AlertTriangle size={18} />
                        <span className="text-xs font-bold uppercase tracking-tighter">Risk Level</span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-semibold">
                        {activeVersion.riskScore < 30 ? '✅ Low risk — safe to deploy' : activeVersion.riskScore < 60 ? '⚠️ Medium risk — review conditions' : '🔴 High risk — address blockers first'}
                      </p>
                    </div>
                    <div className="neo-raised p-4 rounded-xl flex-grow bg-surface">
                      <div className="flex items-center gap-2 mb-2 text-tertiary">
                        <Brain size={18} />
                        <span className="text-xs font-bold uppercase tracking-tighter">Verdict</span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-semibold">
                        {activeVersion.riskScore < 30 ? 'APPROVE' : activeVersion.riskScore < 60 ? 'APPROVE WITH CONDITIONS' : 'REJECT'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h5 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <BarChart className="text-primary" size={20} /> Verification Metrics
                </h5>
                <div className="space-y-3">
                  <MetricBar label="🧠 Fix Confidence (Mike)" value={`${activeVersion.confidence}%`} progress={activeVersion.confidence} color="bg-primary" delay={0.1} />
                  <MetricBar label="🛡️ Deployment Risk (Alex)" value={`${activeVersion.riskScore}%`} progress={activeVersion.riskScore}
                    color={activeVersion.riskScore < 30 ? 'bg-emerald-500' : activeVersion.riskScore < 60 ? 'bg-amber-500' : 'bg-red-500'} delay={0.2} />
                  <MetricBar label="✅ Overall Readiness"
                    value={`${Math.round((activeVersion.confidence + (100 - activeVersion.riskScore)) / 2)}%`}
                    progress={Math.round((activeVersion.confidence + (100 - activeVersion.riskScore)) / 2)}
                    color="bg-indigo-400" delay={0.3} />
                </div>

                {/* Diff / Patch Viewer */}
                <div className="mt-4 pt-6 border-t border-surface-container">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-bold text-on-surface flex items-center gap-2">
                      <Sparkles className="text-tertiary" size={20} /> Full Patch Detail
                    </h5>
                    <div className="flex gap-3">
                      <button onClick={() => {}} className="px-4 py-2 text-xs font-bold bg-surface neo-raised neo-pressed rounded-lg text-on-surface-variant hover:text-primary transition-colors">Dismiss</button>
                      <button onClick={() => alert('✅ Patch approved! (simulated)')} className="px-4 py-2 text-xs font-bold bg-primary text-white neo-raised neo-pressed rounded-lg hover:bg-indigo-500 transition-colors">Apply Patch</button>
                    </div>
                  </div>
                  <div className={`flex flex-col ${isComparing ? 'lg:flex-row gap-6' : 'gap-4'}`}>
                    {renderDiff(activeVersion, false)}
                    {isComparing && compareVersion && renderDiff(compareVersion, true)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricBar({ label, value, progress, color, delay = 0 }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.4 }}>
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs text-on-surface-variant">{label}</span>
        <span className="text-xs font-bold">{value}</span>
      </div>
      <div className="h-2 w-full neo-inset rounded-full overflow-hidden bg-surface">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`} />
      </div>
    </motion.div>
  );
}
