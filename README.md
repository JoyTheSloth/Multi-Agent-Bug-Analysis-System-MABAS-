# 🕵️ MABAS — Multi-Agent Bug Analysis System

An autonomous, multi-agent AI pipeline that ingests bug reports, dynamically reproduces them via sandboxed Python scripts, analyzes logs, generates patch plans, and reviews fixes — all in a real-time neo-brutalism dashboard.

> **Powered by Groq Cloud (Llama 3.1 8B Instant) + FastAPI + React + Vite**

---

## 🤖 The 5 Agents

| Agent | Role | Persona |
|-------|------|---------|
| 🚨 **Jim** | Triage Agent | Categorizes bug severity and impact |
| 💥 **Bob** | Reproduction Agent | Generates & **actually executes** Python scripts to crash-reproduce the bug |
| 🔍 **Sarah** | Log Analyst | Cross-references logs with Bob's `stderr` to find the root cause |
| 🛠️ **Mike** | Fix Planner | Authors a detailed patch plan with code snippets and rollback steps |
| ✅ **Alex** | Reviewer | Critiques the fix, scores risk (0–100), and delivers a final verdict |

---

## 🚀 How to Run Locally

You need **two terminals running side-by-side**.

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free [Groq Cloud](https://console.groq.com) API key

---

### Step 1 — Clone the Repo

```bash
git clone https://github.com/JoyTheSloth/Multi-Agent-Bug-Analysis-System-MABAS-.git
cd Multi-Agent-Bug-Analysis-System-MABAS-
```

---

### Step 2 — Configure Your API Key

Create a `.env` file in the project root:

```bash
# .env
GROQ_API_KEY=your_groq_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```

> Get your free key at: https://console.groq.com/keys

---

### Step 3 — Start the Backend (Terminal 1)

```bash
# Install uv if you don't have it
pip install uv

# Install backend dependencies
uv pip install fastapi uvicorn groq python-dotenv pydantic

# Run the backend server (must be on port 8000)
uv run uvicorn backend.main:app --port 8000 --reload
```

✅ You should see: `Uvicorn running on http://0.0.0.0:8000`

---

### Step 4 — Start the Frontend (Terminal 2)

```bash
# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

✅ You should see: `Local: http://localhost:5173`

---

### Step 5 — Run Your First Analysis

1. Open `http://localhost:5173` in your browser
2. Click **Jobs** in the sidebar
3. Paste a bug report and logs into the input boxes
4. Click **🚀 Launch Full Agentic Analysis**
5. Watch Jim, Bob, Sarah, Mike, and Alex work in real-time!

---

## 🧪 Example Inputs

**Bug Report:**
```
When I hit the checkout button on the mobile app, the app crashes and returns 
me to the home screen. I am logged in, but my cart was empty during one test, 
and full during another.
```

**Logs:**
```
[INFO] 14:02:01 Request POST /api/checkout started
[WARN] 14:02:05 PaymentGateway timed out after 4000ms
[ERROR] 14:02:11 NullReferenceException in PaymentProcessor.Process(). User context is null.
[ERROR] 14:02:12 StackTrace: at MobileApp.Payment.Submit() line 82
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Full 5-agent pipeline (Triage → Repro → Log → Fix → Review) |
| `POST` | `/api/audit` | Sarah audits raw logs |
| `POST` | `/api/explain-log` | Explains a single log line |
| `POST` | `/api/plan-fix` | Mike generates a patch plan |
| `POST` | `/api/review-fix` | Alex reviews a patch plan |
| `GET`  | `/api/status` | Dashboard telemetry (agent status, stats) |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Framer Motion, React-Markdown
- **Backend**: FastAPI, Uvicorn, Pydantic, Python-dotenv
- **AI Engine**: Groq SDK — `llama-3.1-8b-instant`
- **Sandboxing**: `subprocess.run` executes generated repro scripts locally in `backend/repro.py`

---

## 📁 Project Structure

```
silk-analysis/
├── backend/
│   └── main.py          # FastAPI server + all 5 agent functions
├── src/
│   ├── screens/
│   │   ├── AnalysisTraceScreen.tsx   # Jobs / full pipeline UI
│   │   ├── DashboardScreen.tsx       # Overview dashboard
│   │   ├── LogExplorerScreen.tsx     # Log audit + explainer
│   │   ├── FixPlannerScreen.tsx      # Fix planner + reviewer
│   │   └── DocumentationScreen.tsx  # In-app docs
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   └── App.tsx
├── .env.example         # Copy this to .env and fill in your key
├── package.json
└── README.md
```

---

*Built with precision and speed. Powered by Groq.*
