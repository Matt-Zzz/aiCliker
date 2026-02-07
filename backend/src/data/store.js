import { v4 as uuidv4 } from 'uuid';

class InMemoryStore {
  constructor() {
    this.users = [];
    this.credentials = [];
    this.logs = [];
    this.tasks = [];
  }

  // ── Users ──
  findUser(email) {
    return this.users.find((u) => u.email === email) || null;
  }

  createUser({ email, name }) {
    const user = {
      id: uuidv4(),
      email,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  // ── Credentials ──
  listCredentials() {
    return this.credentials;
  }

  upsertCredential(credential) {
    const existingIndex = this.credentials.findIndex((c) => c.id === credential.id);
    if (existingIndex > -1) {
      this.credentials[existingIndex] = {
        ...this.credentials[existingIndex],
        ...credential,
        lastSynced: new Date().toISOString(),
      };
      return this.credentials[existingIndex];
    }

    const newCred = {
      ...credential,
      id: uuidv4(),
      lastSynced: new Date().toISOString(),
    };
    this.credentials.push(newCred);
    return newCred;
  }

  removeCredential(id) {
    this.credentials = this.credentials.filter((c) => c.id !== id);
  }

  // ── Logs ──
  addLog(log) {
    this.logs.unshift({
      ...log,
      id: uuidv4(),
      timestamp: log.timestamp || new Date().toISOString(),
    });
  }

  getLogs() {
    return this.logs;
  }

  // ── Tasks ──
  queueTask(task) {
    const entry = {
      id: uuidv4(),
      status: 'queued',
      createdAt: new Date().toISOString(),
      ...task,
    };
    this.tasks.push(entry);
    return entry;
  }

  listTasks() {
    return this.tasks;
  }
}

export const store = new InMemoryStore();
