import { useState, useMemo } from "react";

export default function Logs({ logs }) {
  const [selectedLog, setSelectedLog] = useState(null);
  const [search, setSearch] = useState("");

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (log) =>
        log.question.toLowerCase().includes(q) ||
        log.answer.toLowerCase().includes(q) ||
        log.platform.toLowerCase().includes(q) ||
        (log.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [logs, search]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Academic History</h1>
          <p className="text-slate-500 mt-1">
            Review your past queries and solutions.
          </p>
        </div>
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search solutions..."
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm w-64"
          />
        </div>
      </header>

      {/* Empty State */}
      {logs.length === 0 ? (
        <div className="bg-white border-2 border-slate-200 border-dashed rounded-3xl p-20 text-center">
          <div className="text-slate-200 text-7xl mb-4">
            <i className="fa-solid fa-folder-open"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900">No logs found</h3>
          <p className="text-slate-400 mt-2">
            Questions solved by the AI Agent will appear here.
          </p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <div className="text-slate-300 text-5xl mb-3">
            <i className="fa-solid fa-search"></i>
          </div>
          <p className="text-slate-500">No results for "{search}"</p>
        </div>
      ) : (
        /* Logs Table */
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Platform
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Question Preview
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Answer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                        {log.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-xs">
                        {log.question}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-mono font-bold">
                        {log.answer?.length > 40
                          ? log.answer.slice(0, 40) + "..."
                          : log.answer}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-bold text-sm">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  {selectedLog.platform} Archive
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Question Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">
                  Original Question
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-800 leading-relaxed italic">
                  "{selectedLog.question}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">
                    Answer
                  </h4>
                  <p className="text-lg font-mono font-bold text-blue-900 break-words">
                    {selectedLog.answer}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <h4 className="text-xs font-bold text-green-600 uppercase mb-1">
                    Status
                  </h4>
                  <p className="text-lg font-bold text-green-900">Verified</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">
                  Step-by-Step Solution
                </h4>
                <div className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-6 rounded-2xl border border-slate-100 leading-relaxed">
                  {selectedLog.solution}
                </div>
              </div>

              {selectedLog.tags && selectedLog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedLog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
              <button
                className="px-5 py-2.5 text-slate-600 font-bold hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
