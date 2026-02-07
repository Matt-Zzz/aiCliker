import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { store } from './data/store.js';
import { solveAcademicQuestion } from './services/agent.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const origins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: origins.length === 0 ? '*' : origins }));
app.use(express.json());

// ────────────────────────────────────────
// API Routes
// ────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication (mock – accepts any valid email/password)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = store.findUser(email);
  if (user) {
    return res.json({ id: user.id, email: user.email, name: user.name });
  }

  return res.json({
    id: email,
    email,
    name: email.split('@')[0],
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existing = store.findUser(email);
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const user = store.createUser({ email, name: name || email.split('@')[0] });
  return res.status(201).json(user);
});

// Credential management
app.get('/api/credentials', (_req, res) => {
  res.json(store.listCredentials());
});

app.post('/api/credentials', (req, res) => {
  const { username, platform, status } = req.body;
  if (!username || !platform) {
    return res.status(400).json({ message: 'username and platform are required' });
  }
  const credential = store.upsertCredential({
    username,
    platform,
    status: status || 'connected',
  });
  res.status(201).json(credential);
});

app.delete('/api/credentials/:id', (req, res) => {
  store.removeCredential(req.params.id);
  res.status(204).send();
});

// AI Agent solver
app.post('/api/agent/solve', async (req, res) => {
  try {
    const { question, platform } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'question is required' });
    }

    const payload = await solveAcademicQuestion(question, platform || 'Manual');

    const logEntry = {
      platform: platform || 'Manual',
      question,
      answer: payload.answer,
      solution: payload.solution,
      tags: payload.tags || ['ai'],
      timestamp: new Date().toISOString(),
    };
    store.addLog(logEntry);

    res.json(payload);
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ message: error.message || 'Agent error' });
  }
});

// Logs
app.get('/api/logs', (_req, res) => {
  res.json(store.getLogs());
});

// Task orchestration stub
app.post('/api/tasks', (req, res) => {
  const { credentials } = req.body;
  const task = store.queueTask({ credentials });
  setTimeout(() => {
    task.status = 'completed';
  }, 2000);
  res.status(202).json(task);
});

app.get('/api/tasks', (_req, res) => {
  res.json(store.listTasks());
});

// ────────────────────────────────────────
// Serve frontend in production
// ────────────────────────────────────────
if (NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));

  // All non-API routes serve index.html (SPA fallback)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// ────────────────────────────────────────
// Start
// ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`ClassMate AI backend running on http://localhost:${PORT} [${NODE_ENV}]`);
});
