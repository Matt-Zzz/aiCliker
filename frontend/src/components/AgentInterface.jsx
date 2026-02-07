import { useState } from "react";
import { apiFetch } from "../api";
import PlatformAgent from "./PlatformAgent";

export default function AgentInterface({ credentials, onSolve }) {
  const [mode, setMode] = useState("solve"); // "solve" | "platform"

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">AI Academic Agent</h1>
        <p className="text-slate-500 mt-2">
          Paste a question for an instant solution, or let the agent navigate
          your platform automatically.
        </p>
      </header>

      {/* Mode Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex bg-slate-100 rounded-2xl p-1">
          <button
            onClick={() => setMode("solve")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === "solve"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
            Quick Solve
          </button>
          <button
            onClick={() => setMode("platform")}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === "platform"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <i className="fa-solid fa-globe mr-2"></i>
            Platform Agent
          </button>
        </div>
      </div>

      {/* ── Quick Solve Mode ── */}
      {mode === "solve" && (
        <QuickSolve credentials={credentials} onSolve={onSolve} />
      )}

      {/* ── Platform Agent Mode ── */}
      {mode === "platform" && <PlatformAgent credentials={credentials} />}
    </div>
  );
}

/* ─── Quick Solve (the original single-question solver) ───────────────── */

function QuickSolve({ credentials, onSolve }) {
  const [question, setQuestion] = useState("");
  const [platform, setPlatform] = useState(
    credentials.length > 0 ? credentials[0].platform : "Other"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSolve = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const data = await apiFetch("/api/agent/solve", {
        method: "POST",
        body: JSON.stringify({ question, platform }),
      });
      setResult(data);

      onSolve({
        id: crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        platform,
        question,
        answer: data.answer,
        solution: data.solution,
        tags: data.tags || [],
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to solve question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Input Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Target Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {credentials.length === 0 ? (
                <p className="text-sm text-slate-400 italic">
                  No connected platforms. Defaulting to 'Other'.
                </p>
              ) : (
                credentials.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setPlatform(c.platform)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                      platform === c.platform
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {c.platform}
                  </button>
                ))
              )}
              <button
                onClick={() => setPlatform("Other")}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                  platform === "Other"
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300"
                }`}
              >
                Other / Manual
              </button>
            </div>
          </div>

          {/* Question Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              The Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[160px] resize-none text-lg leading-relaxed"
              placeholder="Paste the homework question or iClicker prompt here..."
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <i className="fa-solid fa-circle-exclamation mr-2"></i>
              {error}
            </div>
          )}

          {/* Solve Button */}
          <button
            onClick={handleSolve}
            disabled={loading || !question.trim()}
            className={`w-full py-5 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-3 ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-[0.98]"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Agent is Thinking...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span>Generate Solution</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white border-2 border-green-500 rounded-3xl overflow-hidden shadow-xl">
          <div className="bg-green-50 p-6 border-b border-green-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-xl font-bold text-green-900 flex items-center">
              <i className="fa-solid fa-check-circle mr-2"></i>
              Solution Generated
            </h3>
            <div className="flex flex-wrap gap-2">
              {(result.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-green-200 text-green-800 text-[10px] font-bold rounded-lg uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                Final Answer
              </p>
              <div className="p-4 bg-slate-900 text-white rounded-xl text-xl font-mono leading-relaxed">
                {result.answer}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                Step-by-Step Solution
              </p>
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100">
                {result.solution}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400 flex items-center justify-center">
              <i className="fa-solid fa-info-circle mr-1"></i>
              Logged to history successfully. Use this for study reference.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
