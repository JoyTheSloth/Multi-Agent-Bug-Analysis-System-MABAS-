# 🕵️ MABAS (Multi-Agent Bug Analysis System)

Welcome to **MABAS**, a fully autonomous, multi-agent AI pipeline designed to ingest bug reports, dynamically reproduce them via scripted sandboxes, analyze logs, generate patch plans, and review fixes—all displayed in a beautiful, neo-brutalism dashboard.

---

## ✨ Features

- **Multi-Agent Architecture**: 5 specialized AI agents powered by **Groq Cloud (Llama 3.1)** executing a sequential chain-of-thought.
  - 🚨 **Jim (Triage Agent)**: Categorizes severity and parses initial bug reports.
  - 💥 **Bob (Reproduction Agent)**: Dynamically generates and executes Python scripts (`repro.py`) locally to trigger crashes.
  - 🔍 **Sarah (Log Analyst)**: Identifies the root cause by cross-referencing system logs with Bob's `stderr` traces.
  - 🛠️ **Mike (Fix Planner)**: Authors a detailed patch plan, including code replacements and rollback instructions.
  - ✅ **Alex (Reviewer)**: Critiques Mike's fixes, calculates risk arrays, and sets validation boundaries.
- **Agentic Sandboxing**: Safely executes Python code generation without breaking your local environment.
- **Real-Time Data Streams**: Frontend React dashboard streams real-time AI logic and live server analytics straight from FastAPI endpoints.
- **Actionable Tooling**: Built-in AI Log Explainer, AI System Audit, Version Comparer, and Markdown exporters.

---

## 🚀 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS V4, Framer Motion, React-Markdown.
- **Backend**: FastAPI, Uvicorn, Python 3, Pydantic.
- **AI Engine**: Groq SDK (Llama 3.1 8B instant).

---

## ⚙️ How to Run Locally

You need two side-by-side terminal instances running simultaneously for the system to process agentic analysis.

### 1️⃣ Start the FastAPI Backend
Ensure you have `uv` (or `pip`) installed. 

```bash
# Verify you are in the project root directory
# Set up your Groq Cloud API environment variable:
# In Bash: export GROQ_API_KEY="your-key-here"
# In PowerShell: $env:GROQ_API_KEY="your-key-here"

# Install backend dependencies
uv pip install fastapi uvicorn groq python-dotenv pydantic

# Run the backend inference server
uv run uvicorn backend.main:app --port 8000
```
> The backend must be running on port `8000`.

### 2️⃣ Start the React Frontend
Open a completely new terminal instance inside the same project root.

```bash
# Install Node dependencies
npm install

# Start the Vite development environment
npm run dev
```

### 3️⃣ Launch Analysis
- Navigate to `http://localhost:3001` (or your local Vite address).
- Go to the **Jobs** tab.
- Click **Launch Full Agentic Analysis** to watch Jim, Bob, Sarah, Mike, and Alex tackle the bug live!

---

## 🔮 Usage Examples

Paste this into the **Jobs -> Bug Report** block to test the agents:
> *"When I hit the checkout button on the mobile app, the app crashes and returns me to the home screen. I am logged in, but my cart was empty during one test, and full during another."*

Paste this into the **Jobs -> Logs** block:
> \`[INFO] 14:02:01 Request POST /api/checkout started\`<br>
> \`[WARN] 14:02:05 PaymentGateway timed out after 4000ms\`<br>
> \`[ERROR] 14:02:11 NullReferenceException in PaymentProcessor.Process(). User context is null.\`<br>
> \`[ERROR] 14:02:12 StackTrace: at MobileApp.Payment.Submit() line 82\`

Click **Launch** and watch the system orchestrate!

---

*Designed and engineered with precision and speed.*
