import { useState, useEffect, useCallback } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import CredentialsVault from "./components/CredentialsVault";
import AgentInterface from "./components/AgentInterface";
import Logs from "./components/Logs";
import Navbar from "./components/Navbar";
import { apiFetch } from "./api";

export default function App() {
  // ── Auth State ──
  const [user, setUser] = useState(null);

  // ── App State ──
  const [activeTab, setActiveTab] = useState("dashboard");
  const [credentials, setCredentials] = useState([]);
  const [logs, setLogs] = useState([]);

  // ── Initialize from localStorage ──
  useEffect(() => {
    const storedUser = localStorage.getItem("classmate_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("classmate_user");
      }
    }

    const storedCreds = localStorage.getItem("classmate_creds");
    if (storedCreds) {
      try {
        setCredentials(JSON.parse(storedCreds));
      } catch {
        localStorage.removeItem("classmate_creds");
      }
    }

    const storedLogs = localStorage.getItem("classmate_logs");
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch {
        localStorage.removeItem("classmate_logs");
      }
    }
  }, []);

  // ── Persist credentials & logs ──
  useEffect(() => {
    localStorage.setItem("classmate_creds", JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem("classmate_logs", JSON.stringify(logs));
  }, [logs]);

  // ── Sync credentials from backend ──
  const fetchCredentials = useCallback(async () => {
    try {
      const data = await apiFetch("/api/credentials");
      setCredentials(data);
    } catch (err) {
      console.error("Failed to fetch credentials:", err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await apiFetch("/api/logs");
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  }, []);

  // ── Fetch on mount (backend sync) ──
  useEffect(() => {
    fetchCredentials();
    fetchLogs();
  }, [fetchCredentials, fetchLogs]);

  // ── Auth Handlers ──
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("classmate_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("classmate_user");
    setActiveTab("dashboard");
  };

  // ── Credential Handlers ──
  const addCredential = async ({ platform, username }) => {
    try {
      const cred = await apiFetch("/api/credentials", {
        method: "POST",
        body: JSON.stringify({ platform, username }),
      });
      setCredentials((prev) => [...prev, cred]);
    } catch (err) {
      console.error("Failed to add credential:", err);
    }
  };

  const removeCredential = async (id) => {
    try {
      await apiFetch(`/api/credentials/${id}`, { method: "DELETE" });
      setCredentials((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to remove credential:", err);
    }
  };

  // ── Log Handler ──
  const addLog = (log) => {
    setLogs((prev) => [log, ...prev]);
  };

  // ── Render Auth Screen ──
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // ── Render Main App ──
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        userName={user.name || user.email?.split("@")[0] || "Student"}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 pb-24 md:pb-6">
        {activeTab === "dashboard" && (
          <Dashboard
            user={user}
            credentialsCount={credentials.length}
            solvedCount={logs.length}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === "vault" && (
          <CredentialsVault
            credentials={credentials}
            onAdd={addCredential}
            onRemove={removeCredential}
          />
        )}
        {activeTab === "agent" && (
          <AgentInterface credentials={credentials} onSolve={addLog} />
        )}
        {activeTab === "logs" && <Logs logs={logs} />}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 px-1 z-50 shadow-lg shadow-slate-900/5">
        {[
          { id: "dashboard", icon: "fa-house", label: "Home" },
          { id: "vault", icon: "fa-key", label: "Vault" },
          { id: "agent", icon: "fa-robot", label: "Agent" },
          { id: "logs", icon: "fa-list-check", label: "Logs" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center space-y-1 py-1.5 px-3 rounded-xl transition-all ${
              activeTab === tab.id
                ? "text-blue-600 bg-blue-50"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-lg`}></i>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
