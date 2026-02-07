# ClassMate AI - Your Academic Co-Pilot

AI-powered academic assistant that connects to your class platforms (Canvas, iClicker, Pearson, Blackboard), navigates them autonomously with a vision-based browser agent, and solves questions with step-by-step explanations.

## Features

- **Login / Sign Up** – Account authentication
- **Credential Vault** – Securely store credentials for Canvas, iClicker, Pearson, Blackboard
- **Quick Solve** – Paste any academic question and get an instant answer + step-by-step solution (powered by Google Gemini)
- **Platform Agent** – AI-driven browser automation that logs into your platforms, navigates to assignments/quizzes, extracts questions, and solves them automatically
  - Vision-based — uses Gemini 2.0 Flash to understand screenshots
  - ReAct loop — Observe → Think → Act, up to 30 steps
  - Live progress — real-time SSE stream with screenshots, thoughts, and actions
  - Auto-solve — extracted content is sent to the AI solver immediately
- **History Logs** – Searchable archive of all solved questions with detailed modal view
- **Responsive UI** – Works on desktop and mobile with bottom navigation

## How the Platform Agent Works

```
User provides: platform URL + goal + credentials
                    ↓
    ┌─── ReAct Loop (max 30 steps) ───┐
    │ 1. OBSERVE  screenshot + interactive elements        │
    │ 2. THINK    Gemini Vision analyses the page          │
    │ 3. ACT      Playwright executes the decision         │
    │ 4. STREAM   step sent to frontend via SSE            │
    └──────────────────────────────────┘
                    ↓
    Questions found → extract → AI solver → solution
```

The agent can click buttons, fill forms, scroll, navigate links, and extract page content — all guided by the LLM reading the live screenshot.

## Tech Stack

| Layer      | Tech                                                    |
| ---------- | ------------------------------------------------------- |
| Frontend   | React 18, Vite 5, Tailwind CSS, Font Awesome            |
| Backend    | Node.js, Express 4, Google Gemini 2.0 Flash API         |
| Automation | Playwright (headless Chromium), Gemini Vision (multimodal) |
| Streaming  | Server-Sent Events (SSE) for real-time agent progress   |
| Data       | In-memory store (upgrade to DB as needed)                |

## Local Development

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd classmate-ai

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Install Playwright browser
cd ../backend && npx playwright install chromium

# 4. Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY

# 5. Start backend (terminal 1)
cd backend && npm run dev              # http://localhost:4000

# 6. Start frontend (terminal 2)
cd frontend && npm run dev              # http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## Usage

### Quick Solve

1. Go to the **Agent** tab
2. Stay on the **Quick Solve** sub-tab
3. Paste a question, pick a platform, click **Generate Solution**

### Platform Agent

1. Go to the **Agent** tab → switch to **Platform Agent**
2. Enter your platform URL (e.g. `https://canvas.university.edu`)
3. Choose a goal (e.g. "Log in and fetch my assignments")
4. Enter your platform username and password
5. Click **Start Agent**
6. Watch the agent navigate step-by-step with live screenshots
7. Extracted questions are auto-solved and displayed at the bottom

## Deployment

### Option A: Render (Recommended, Free Tier)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Render will auto-detect the `render.yaml` — just click **Create**
5. In the Render dashboard, add your environment variable:
   - `GEMINI_API_KEY` = your Google AI API key
6. Deploy — your app will be live at `https://classmate-ai-xxxx.onrender.com`

> **Note:** The Platform Agent requires Playwright's Chromium binary. The Render build command in `render.yaml` may need updating to include `npx playwright install chromium --with-deps`.

### Option B: Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**
1. Go to [vercel.com](https://vercel.com) → Import Git Repo
2. Set root directory to `frontend`
3. Add env var: `VITE_API_BASE` = your Railway backend URL
4. Deploy

**Backend on Railway:**
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set root directory to `backend`
3. Add env vars: `GEMINI_API_KEY`, `NODE_ENV=production`, `ALLOWED_ORIGINS=https://your-vercel-url.vercel.app`
4. Deploy

### Option C: Manual / VPS

```bash
# Build frontend
cd frontend && npm run build

# Install Playwright browser
cd ../backend && npx playwright install chromium --with-deps

# Start production server
cd ../backend
NODE_ENV=production GEMINI_API_KEY=your-key node src/server.js
```

The backend serves the frontend build at the root URL.

## Project Structure

```
classmate-ai/
├── frontend/                        # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx                 # Login / Signup
│   │   │   ├── Navbar.jsx               # Top + mobile navigation
│   │   │   ├── Dashboard.jsx            # Welcome + stats
│   │   │   ├── CredentialsVault.jsx     # Platform credentials
│   │   │   ├── AgentInterface.jsx       # Mode tabs (Quick Solve / Platform Agent)
│   │   │   ├── PlatformAgent.jsx        # Live browser agent UI
│   │   │   └── Logs.jsx                 # Solution history
│   │   ├── App.jsx                      # Main app + routing
│   │   ├── api.js                       # API + SSE helpers
│   │   └── main.jsx                     # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                         # Express API
│   ├── src/
│   │   ├── server.js                    # Routes + SSE + static serving
│   │   ├── services/
│   │   │   ├── agent.js                 # Gemini text solver
│   │   │   └── browser-agent/
│   │   │       ├── browser.js           # Playwright lifecycle + element extraction
│   │   │       ├── vision.js            # Gemini Vision screenshot analysis
│   │   │       ├── actions.js           # Action executor (click, type, scroll…)
│   │   │       └── agent-loop.js        # ReAct orchestrator + event emission
│   │   └── data/store.js               # In-memory data store
│   ├── .env.example
│   └── package.json
│
├── render.yaml                      # One-click Render deploy
├── package.json                     # Root scripts
└── README.md
```

## API Endpoints

| Method | Route                          | Description                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/api/health`                  | Health check                         |
| POST   | `/api/auth/login`              | Log in                               |
| POST   | `/api/auth/signup`             | Sign up                              |
| GET    | `/api/credentials`             | List saved credentials               |
| POST   | `/api/credentials`             | Add a credential                     |
| DELETE | `/api/credentials/:id`         | Remove a credential                  |
| POST   | `/api/agent/solve`             | Quick Solve — send a question to AI  |
| POST   | `/api/agent/run`               | Start a Platform Agent run           |
| GET    | `/api/agent/tasks/:id/events`  | SSE stream of agent progress         |
| POST   | `/api/agent/tasks/:id/stop`    | Stop a running agent                 |
| GET    | `/api/agent/tasks/:id`         | Get agent task summary               |
| GET    | `/api/logs`                    | Get solution history                 |

## Environment Variables

| Variable           | Where    | Description                          |
| ------------------ | -------- | ------------------------------------ |
| `GEMINI_API_KEY`   | Backend  | Google AI API key for Gemini         |
| `PORT`             | Backend  | Server port (default: 4000)          |
| `NODE_ENV`         | Backend  | `production` enables static serving  |
| `ALLOWED_ORIGINS`  | Backend  | CORS whitelist (comma-separated)     |
| `VITE_API_BASE`    | Frontend | Backend URL (only for split deploy)  |
