export default function Dashboard({ user, credentialsCount, solvedCount, onNavigate }) {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <header>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-slate-500 mt-1">
          Here's your academic progress overview.
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate("vault")}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-left group"
        >
          <div className="bg-blue-100 group-hover:bg-blue-200 p-4 rounded-2xl transition-colors">
            <i className="fa-solid fa-link text-blue-600 text-2xl"></i>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Platforms Connected</p>
            <p className="text-3xl font-bold text-slate-900">{credentialsCount}</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("logs")}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:shadow-md hover:border-green-300 transition-all cursor-pointer text-left group"
        >
          <div className="bg-green-100 group-hover:bg-green-200 p-4 rounded-2xl transition-colors">
            <i className="fa-solid fa-check-double text-green-600 text-2xl"></i>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Questions Solved</p>
            <p className="text-3xl font-bold text-slate-900">{solvedCount}</p>
          </div>
        </button>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
          <div className="bg-purple-100 p-4 rounded-2xl">
            <i className="fa-solid fa-bolt text-purple-600 text-2xl"></i>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Success Rate</p>
            <p className="text-3xl font-bold text-slate-900">
              {solvedCount > 0 ? "98.4%" : "--"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Agent CTA */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3">Start Academic Agent</h2>
            <p className="text-slate-300 mb-8 max-w-md leading-relaxed">
              Our AI agent can solve questions from Canvas, iClicker, Pearson,
              and more. Paste a question and get a step-by-step solution instantly.
            </p>
            <button
              onClick={() => onNavigate("agent")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/20"
            >
              <i className="fa-solid fa-robot"></i>
              <span>Launch AI Agent</span>
            </button>
          </div>
          <i className="fa-solid fa-brain absolute -right-8 -bottom-8 text-white/5 text-[200px] pointer-events-none"></i>
        </section>

        {/* Credential Status */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <i className="fa-solid fa-shield-halved text-blue-600 mr-2"></i>
            Credential Status
          </h2>
          <div className="space-y-4">
            {credentialsCount === 0 ? (
              <div className="text-center py-8">
                <div className="text-slate-200 text-5xl mb-4">
                  <i className="fa-solid fa-vault"></i>
                </div>
                <p className="text-slate-400 italic">No platforms connected yet.</p>
                <button
                  onClick={() => onNavigate("vault")}
                  className="mt-4 text-blue-600 font-semibold hover:underline"
                >
                  Connect your first platform →
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">
                        {credentialsCount} Platform{credentialsCount > 1 ? "s" : ""} Active
                      </span>
                      <p className="text-xs text-slate-400">All connections healthy</p>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-bold uppercase tracking-wider">
                    Connected
                  </span>
                </div>
                <button
                  onClick={() => onNavigate("vault")}
                  className="text-center text-slate-400 text-sm hover:text-blue-600 pt-2 transition"
                >
                  Manage all credentials →
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate("vault")}
            className="flex items-center space-x-3 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
          >
            <div className="bg-blue-100 group-hover:bg-blue-200 p-3 rounded-xl transition-colors">
              <i className="fa-solid fa-plus text-blue-600"></i>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900">Add Platform</p>
              <p className="text-xs text-slate-400">Connect Canvas, iClicker...</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("agent")}
            className="flex items-center space-x-3 p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
          >
            <div className="bg-purple-100 group-hover:bg-purple-200 p-3 rounded-xl transition-colors">
              <i className="fa-solid fa-wand-magic-sparkles text-purple-600"></i>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900">Solve Question</p>
              <p className="text-xs text-slate-400">Use AI Agent now</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("logs")}
            className="flex items-center space-x-3 p-4 rounded-2xl border border-slate-200 hover:border-green-300 hover:bg-green-50/50 transition-all group"
          >
            <div className="bg-green-100 group-hover:bg-green-200 p-3 rounded-xl transition-colors">
              <i className="fa-solid fa-clock-rotate-left text-green-600"></i>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900">View History</p>
              <p className="text-xs text-slate-400">Past solutions & logs</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
