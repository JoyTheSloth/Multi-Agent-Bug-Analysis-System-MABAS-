import { BookOpen, Network, Users, Code, Info, Play, FileText, CheckCircle, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

const exampleBug = `When I hit the checkout button on the mobile app, the app crashes and returns me to the home screen. I am logged in, but my cart was empty during one test, and full during another.`;

const exampleLogs = `[INFO] 2024-05-12 14:02:01 Request POST /api/checkout started
[WARN] 2024-05-12 14:02:05 PaymentGateway timed out after 4000ms
[ERROR] 2024-05-12 14:02:11 NullReferenceException in PaymentProcessor.Process(). User context is null.
[ERROR] 2024-05-12 14:02:12 StackTrace:
  at MobileApp.Payment.Submit() line 82
  at MobileApp.Checkout.Confirm() line 44
[DEBUG] 2024-05-12 14:02:15 Connection closed`;

export default function DocumentationScreen() {
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <header className="space-y-2 border-b border-surface-variant/50 pb-8">
        <h1 className="text-4xl font-bold text-on-surface flex items-center gap-3">
          <BookOpen className="text-primary" size={36} /> Documentation
        </h1>
        <p className="text-on-surface-variant text-lg">
          Welcome to <span className="font-bold text-primary">Silk Analysis</span> — the fully autonomous multi-agent debugging war room.
        </p>
      </header>

      {/* How It Works */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <Network className="text-indigo-500" /> How It Works
        </h2>
        <div className="neo-raised rounded-2xl p-6 bg-surface prose max-w-none text-on-surface leading-relaxed text-sm">
          <p>
            Silk Analysis uses a pipeline of 5 specialized LLM agents powered by <strong>Groq Cloud (Llama 3.1)</strong> and orchestrated by a <strong>FastAPI backend</strong>.
          </p>
          <p>
            Instead of a standard chatbot, Silk executes a sequential "chain of thought" where one agent's output becomes the next agent's input. Crucially, the system actually <strong>executes sandboxed Python scripts locally</strong> to verify bugs before attempting to fix them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AgentCard name="Jim" role="Triage Agent" icon="🚨" desc="Reads the user bug report and categorizes the severity, impact, and high-level issue." color="text-indigo-400" />
          <AgentCard name="Bob" role="Reproduction Agent" icon="💥" desc="Writes a custom Python script (repro.py) and ACTUALLY executes it on the backend to dynamically crash and reproduce the failure." color="text-amber-400" />
          <AgentCard name="Sarah" role="Log Analyst" icon="🔍" desc="Reads the provided logs PLUS the raw stderr output from Bob's crashed script to formulate a definitive Root Cause." color="text-cyan-400" />
          <AgentCard name="Mike" role="Fix Planner" icon="🛠️" desc="Drafts a complete patch plan, writes the replacement code, and determines rollback procedures." color="text-emerald-400" />
          <AgentCard name="Alex" role="Reviewer" icon="✅" desc="Critiques Mike's plan. If Alex finds logical holes, he applies a risk score and conditions for approval." color="text-purple-400" />
        </div>
      </section>

      {/* Example Usage */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2 mt-12">
          <Play className="text-emerald-500" /> Example Run
        </h2>
        <div className="neo-raised rounded-2xl p-6 space-y-6 bg-surface">
          <p className="text-sm text-on-surface-variant">
            Navigate to the <strong>Jobs</strong> (Analysis Trace) screen and copy/paste these examples into the text boxes to watch the agents work live.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Bug Report Example</span>
              <button 
                onClick={() => copyToClipboard(exampleBug, 'bug')}
                className="flex items-center gap-1 text-[10px] neo-inset px-2 py-1 rounded bg-surface hover:text-primary transition-colors text-slate-500 font-bold"
              >
                {copied === 'bug' ? <CheckCircle size={12} className="text-emerald-500"/> : <Copy size={12} />} {copied === 'bug' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="neo-inset p-4 rounded-xl font-mono text-sm bg-slate-900 text-amber-200">
              {exampleBug}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Logs Example</span>
              <button 
                onClick={() => copyToClipboard(exampleLogs, 'logs')}
                className="flex items-center gap-1 text-[10px] neo-inset px-2 py-1 rounded bg-surface hover:text-primary transition-colors text-slate-500 font-bold"
              >
                {copied === 'logs' ? <CheckCircle size={12} className="text-emerald-500"/> : <Copy size={12} />} {copied === 'logs' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="neo-inset p-4 rounded-xl font-mono text-sm bg-slate-900 text-sky-200 whitespace-pre-wrap">
              {exampleLogs}
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2 mt-12">
          <Code className="text-primary" /> System Architecture
        </h2>
        <div className="neo-raised rounded-2xl p-6 bg-surface">
          <div className="prose max-w-none text-sm text-on-surface">
            <ul>
              <li><strong>Frontend</strong>: React + Vite + Tailwind CSS V4 + Framer Motion. Uses Neo-brutalism/Soft-UI design aesthetics.</li>
              <li><strong>Backend</strong>: FastAPI (Python 3). Runs on port <code>8000</code>. Provides <code>/api/analyze</code>, <code>/api/status</code>, <code>/api/audit</code>, etc.</li>
              <li><strong>AI Engine</strong>: <code>groq-sdk</code>. All inference is powered by Groq's lightning-fast LPU hardware running Meta's Llama 3.1 8B instant model.</li>
              <li><strong>Tool Execution</strong>: The backend uses <code>subprocess.Popen</code> to write and execute generated Python scripts inside a local sandbox folder (<code>backend/sandbox</code>) to avoid polluting the workspace or triggering Vite hot-reloads.</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
}

function AgentCard({ name, role, icon, desc, color }: any) {
  return (
    <div className="p-5 neo-inset rounded-xl bg-surface flex flex-col gap-3 hover:scale-[1.02] transition-transform">
      <div className="flex items-center gap-3 border-b border-surface-variant/50 pb-3">
        <div className="w-10 h-10 neo-raised rounded-full flex items-center justify-center text-xl">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-on-surface">{name}</h3>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>
            {role}
          </span>
        </div>
      </div>
      <p className="text-xs text-on-surface-variant leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
