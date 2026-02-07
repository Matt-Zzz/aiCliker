import { useState } from "react";

const PLATFORMS = ["Canvas", "iClicker", "Pearson", "Blackboard", "Other"];

const PLATFORM_ICONS = {
  Canvas: "fa-c",
  iClicker: "fa-hand-pointer",
  Pearson: "fa-p",
  Blackboard: "fa-chalkboard",
  Other: "fa-link",
};

const PLATFORM_COLORS = {
  Canvas: "bg-red-500",
  iClicker: "bg-green-500",
  Pearson: "bg-blue-500",
  Blackboard: "bg-orange-500",
  Other: "bg-slate-500",
};

export default function CredentialsVault({ credentials, onAdd, onRemove }) {
  const [showAdd, setShowAdd] = useState(false);
  const [platform, setPlatform] = useState("Canvas");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onAdd({ platform, username, password });
      setUsername("");
      setPassword("");
      setShowAdd(false);
    } catch (err) {
      console.error("Failed to save credential:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Credential Vault</h1>
          <p className="text-slate-500 mt-1">
            Manage secure connections to your academic platforms.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`px-5 py-2.5 font-bold rounded-xl flex items-center space-x-2 transition-all ${
            showAdd
              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
              : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
          }`}
        >
          <i className={`fa-solid ${showAdd ? "fa-xmark" : "fa-plus"}`}></i>
          <span>{showAdd ? "Cancel" : "Add Platform"}</span>
        </button>
      </header>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white border-2 border-blue-500 rounded-3xl p-8 shadow-xl shadow-blue-500/10">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <i className="fa-solid fa-plug text-blue-600 mr-2"></i>
            Connect New Platform
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Account Username / Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="student@university.edu"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Platform Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-slate-400 mt-2 flex items-center">
                <i className="fa-solid fa-lock mr-1"></i>
                Your credentials are encrypted and stored securely.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition disabled:opacity-60"
            >
              {saving ? (
                <span className="flex items-center justify-center space-x-2">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Connecting...</span>
                </span>
              ) : (
                "Connect Securely"
              )}
            </button>
          </form>
        </div>
      )}

      {/* Credentials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {credentials.length === 0 ? (
          <div className="col-span-full bg-white border-2 border-slate-200 border-dashed rounded-3xl p-16 text-center">
            <div className="text-slate-200 text-7xl mb-4">
              <i className="fa-solid fa-vault"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Vault is Empty</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Connect your academic accounts to allow the AI Agent to help with
              your assignments.
            </p>
          </div>
        ) : (
          credentials.map((cred) => (
            <div
              key={cred.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex justify-between items-center group hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`${
                    PLATFORM_COLORS[cred.platform] || "bg-slate-500"
                  } w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm`}
                >
                  <i
                    className={`fa-solid ${
                      PLATFORM_ICONS[cred.platform] || "fa-link"
                    } text-lg`}
                  ></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{cred.platform}</h4>
                  <p className="text-sm text-slate-500">{cred.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right mr-2 hidden sm:block">
                  <p className="text-xs font-bold text-green-600 uppercase">
                    Active
                  </p>
                  {cred.lastSynced && (
                    <p className="text-[10px] text-slate-400">
                      {new Date(cred.lastSynced).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemove(cred.id)}
                  className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Remove platform"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
