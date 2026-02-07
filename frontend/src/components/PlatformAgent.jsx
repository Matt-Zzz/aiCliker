import { useState, useEffect, useRef } from "react";
import { API_BASE } from "../api";

const PRESET_GOALS = [
  "Log in and fetch my assignments with due dates",
  "Find active quiz or iClicker questions",
  "Check my grades and feedback",
  "Browse course materials and lecture notes",
];

export default function PlatformAgent({ credentials: vaultCredentials }) {
  // ── Config state ──
  const [url, setUrl] = useState("");
  const [goal, setGoal] = useState(PRESET_GOALS[0]);
  const [customGoal, setCustomGoal] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // ── Agent run state ──
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | running | completed | error | stopped
  const [statusMessage, setStatusMessage] = useState("");
  const [steps, setSteps] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [expandedStep, setExpandedStep] = useState(null);

  const feedRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Pre-fill username when a vault credential is available
  useEffect(() => {
    if (vaultCredentials.length > 0 && !username) {
      setUsername(vaultCredentials[0].username || "");
    }
  }, [vaultCredentials]);

  // Auto-scroll the activity feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [steps]);

  // ── SSE connection ──
  useEffect(() => {
    if (!taskId) return;

    const es = new EventSource(`${API_BASE}/api/agent/tasks/${taskId}/events`);
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      const event = JSON.parse(e.data);

      switch (event.type) {
        case "connected":
          setStatus("running");
          setStatusMessage("Connected to agent…");
          break;

        case "status":
          setStatusMessage(event.message);
          break;

        case "observation":
          setSteps((prev) => {
            const existing = prev.find((s) => s.step === event.step);
            if (existing)
              return prev.map((s) =>
                s.step === event.step ? { ...s, ...event } : s
              );
            return [...prev, { step: event.step, ...event }];
          });
          break;

        case "thought":
          setSteps((prev) =>
            prev.map((s) =>
              s.step === event.step
                ? {
                    ...s,
                    thought: event.thought,
                    actionName: event.action,
                    actionValue: event.value,
                  }
                : s
            )
          );
          break;

        case "action":
          setSteps((prev) =>
            prev.map((s) =>
              s.step === event.step
                ? { ...s, result: event.message, success: event.success }
                : s
            )
          );
          break;

        case "extraction":
          setSteps((prev) =>
            prev.map((s) =>
              s.step === event.step
                ? { ...s, extraction: event.preview }
                : s
            )
          );
          break;

        case "solution":
          setSolutions((prev) => [...prev, event]);
          break;

        case "done":
          setStatus("completed");
          setStatusMessage(event.message || "Task completed");
          es.close();
          break;

        case "error":
          setStatus("error");
          setStatusMessage(event.message || "An error occurred");
          es.close();
          break;
      }
    };

    es.onerror = () => {
      if (status === "running") {
        setStatus("error");
        setStatusMessage("Lost connection to agent");
      }
      es.close();
    };

    return () => es.close();
  }, [taskId]);

  // ── Handlers ──
  const handleStart = async () => {
    if (!url.trim()) return;

    setSteps([]);
    setSolutions([]);
    setStatus("running");
    setStatusMessage("Starting agent…");
    setExpandedStep(null);

    try {
      const res = await fetch(`${API_BASE}/api/agent/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startUrl: url.trim(),
          goal: goal === "custom" ? customGoal : goal,
          credentials: username ? { username, password } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start agent");
      setTaskId(data.taskId);
    } catch (err) {
      setStatus("error");
      setStatusMessage(err.message);
    }
  };

  const handleStop = async () => {
    if (!taskId) return;
    try {
      await fetch(`${API_BASE}/api/agent/tasks/${taskId}/stop`, {
        method: "POST",
      });
      setStatus("stopped");
      setStatusMessage("Agent stopped");
      eventSourceRef.current?.close();
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setTaskId(null);
    setStatus("idle");
    setStatusMessage("");
    setSteps([]);
    setSolutions([]);
    setExpandedStep(null);
    eventSourceRef.current?.close();
  };

  const isRunning = status === "running";
  const isDone = ["completed", "error", "stopped"].includes(status);

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* ── Config Panel ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center">
          <i className="fa-solid fa-globe text-blue-500 mr-2"></i>
          Platform Agent Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Platform URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isRunning}
              placeholder="https://canvas.university.edu or https://student.iclicker.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Goal */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={isRunning}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            >
              {PRESET_GOALS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
              <option value="custom">Custom goal…</option>
            </select>
            {goal === "custom" && (
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                disabled={isRunning}
                placeholder="Describe what the agent should do…"
                className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              />
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Username / Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isRunning}
              placeholder="student@university.edu"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isRunning}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            />
            <p className="text-xs text-slate-400 mt-1">
              <i className="fa-solid fa-lock mr-1"></i>
              Used only during this session — never stored.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {!isRunning && !isDone && (
            <button
              onClick={handleStart}
              disabled={!url.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <i className="fa-solid fa-play"></i>
              <span>Start Agent</span>
            </button>
          )}

          {isRunning && (
            <button
              onClick={handleStop}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center space-x-2"
            >
              <i className="fa-solid fa-stop"></i>
              <span>Stop Agent</span>
            </button>
          )}

          {isDone && (
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center space-x-2"
            >
              <i className="fa-solid fa-arrow-rotate-left"></i>
              <span>New Run</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Status Banner ── */}
      {status !== "idle" && (
        <div
          className={`flex items-center space-x-3 px-5 py-3 rounded-2xl text-sm font-semibold ${
            isRunning
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : status === "completed"
              ? "bg-green-50 text-green-700 border border-green-200"
              : status === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          {isRunning && (
            <i className="fa-solid fa-spinner fa-spin text-blue-500"></i>
          )}
          {status === "completed" && (
            <i className="fa-solid fa-circle-check text-green-500"></i>
          )}
          {status === "error" && (
            <i className="fa-solid fa-circle-exclamation text-red-500"></i>
          )}
          {status === "stopped" && (
            <i className="fa-solid fa-circle-stop text-slate-400"></i>
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ── Activity Feed ── */}
      {steps.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center">
              <i className="fa-solid fa-list-timeline text-blue-500 mr-2"></i>
              Agent Activity
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {steps.length} step{steps.length !== 1 && "s"}
            </span>
          </div>

          <div
            ref={feedRef}
            className="max-h-[600px] overflow-y-auto divide-y divide-slate-100"
          >
            {steps.map((s) => (
              <div
                key={s.step}
                className="p-4 md:p-5 hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() =>
                  setExpandedStep(expandedStep === s.step ? null : s.step)
                }
              >
                {/* Step header */}
                <div className="flex items-start gap-4">
                  {/* Step badge */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      s.success === false
                        ? "bg-red-100 text-red-600"
                        : s.success
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {s.step}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Thought */}
                    {s.thought && (
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {s.thought}
                      </p>
                    )}

                    {/* Action + result */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      {s.actionName && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700">
                          {s.actionName}
                          {s.actionValue ? `(${s.actionValue})` : ""}
                        </span>
                      )}
                      {s.result && (
                        <span
                          className={`text-xs ${
                            s.success === false
                              ? "text-red-500"
                              : "text-slate-400"
                          }`}
                        >
                          {s.result}
                        </span>
                      )}
                    </div>

                    {/* Extraction preview */}
                    {s.extraction && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 max-h-24 overflow-y-auto whitespace-pre-wrap">
                        <i className="fa-solid fa-file-lines mr-1"></i>
                        {s.extraction}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail */}
                  {s.screenshot && (
                    <div className="flex-shrink-0 hidden sm:block">
                      <img
                        src={`data:image/png;base64,${s.screenshot}`}
                        alt={`Step ${s.step}`}
                        className="w-28 h-[70px] object-cover object-top rounded-lg border border-slate-200 shadow-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Expanded screenshot */}
                {expandedStep === s.step && s.screenshot && (
                  <div className="mt-4">
                    <img
                      src={`data:image/png;base64,${s.screenshot}`}
                      alt={`Step ${s.step} full`}
                      className="w-full rounded-xl border border-slate-200 shadow-md"
                    />
                    <p className="text-xs text-slate-400 mt-1 text-center">
                      {s.url || ""}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Solutions ── */}
      {solutions.length > 0 && (
        <div className="bg-white border-2 border-green-500 rounded-3xl overflow-hidden shadow-xl">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h3 className="text-lg font-bold text-green-900 flex items-center">
              <i className="fa-solid fa-brain mr-2"></i>
              AI Solutions ({solutions.length})
            </h3>
          </div>

          <div className="divide-y divide-green-100">
            {solutions.map((sol, i) => (
              <div key={i} className="p-6 space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {(sol.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-green-200 text-green-800 text-[10px] font-bold rounded-lg uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Answer */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Answer
                  </p>
                  <div className="p-3 bg-slate-900 text-white rounded-xl font-mono text-sm leading-relaxed">
                    {sol.answer}
                  </div>
                </div>

                {/* Solution */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Step-by-Step Solution
                  </p>
                  <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {sol.solution}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
