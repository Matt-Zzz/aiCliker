# ClassMate AI - Your Academic Co-Pilot

AI-powered academic assistant that connects to your class platforms (Canvas, iClicker, Pearson, Blackboard) and solves questions with step-by-step explanations.

## Features

- **Login / Sign Up** – Account authentication
- **Credential Vault** – Securely store credentials for Canvas, iClicker, Pearson, Blackboard
- **AI Agent** – Paste any academic question and get an instant answer + step-by-step solution (powered by Google Gemini)
- **History Logs** – Searchable archive of all solved questions with detailed modal view
- **Responsive UI** – Works on desktop and mobile with bottom navigation

## Tech Stack

| Layer    | Tech                                    |
| -------- | --------------------------------------- |
| Frontend | React 18, Vite 5, Tailwind CSS, Font Awesome |
| Backend  | Node.js, Express 4, Google Gemini API   |
| Data     | In-memory store (upgrade to DB as needed) |

## Local Development

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd "ClassMate AI"

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY

# 4. Start backend (terminal 1)
cd backend && node src/server.js        # http://localhost:4000

# 5. Start frontend (terminal 2)
cd frontend && npm run dev              # http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## Deployment

### Option A: Render (Recommended, Free Tier)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Render will auto-detect the `render.yaml` — just click **Create**
5. In the Render dashboard, add your environment variable:
   - `GEMINI_API_KEY` = your Google AI API key
6. Deploy — your app will be live at `https://classmate-ai-xxxx.onrender.com`

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

# Start production server
cd ../backend
NODE_ENV=production GEMINI_API_KEY=your-key node src/server.js
```

The backend serves the frontend build at the root URL.

## Project Structure

```
ClassMate AI/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx           # Login/Signup
│   │   │   ├── Navbar.jsx         # Top navigation
│   │   │   ├── Dashboard.jsx      # Welcome + stats
│   │   │   ├── CredentialsVault.jsx  # Platform credentials
│   │   │   ├── AgentInterface.jsx    # AI question solver
│   │   │   └── Logs.jsx           # Solution history
│   │   ├── App.jsx                # Main app + routing
│   │   ├── api.js                 # API helper
│   │   └── main.jsx               # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                  # Express API
│   ├── src/
│   │   ├── server.js              # Routes + static serving
│   │   ├── services/agent.js      # Gemini AI integration
│   │   └── data/store.js          # In-memory data store
│   ├── .env.example
│   └── package.json
│
├── render.yaml               # One-click Render deploy
├── package.json              # Root scripts
└── README.md
```

## Environment Variables

| Variable           | Where   | Description                        |
| ------------------ | ------- | ---------------------------------- |
| `GEMINI_API_KEY`   | Backend | Google AI API key for Gemini       |
| `PORT`             | Backend | Server port (default: 4000)        |
| `NODE_ENV`         | Backend | `production` enables static serving |
| `ALLOWED_ORIGINS`  | Backend | CORS whitelist (comma-separated)   |
| `VITE_API_BASE`    | Frontend | Backend URL (only for split deploy) |
