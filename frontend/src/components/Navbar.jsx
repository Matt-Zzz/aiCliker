export default function Navbar({ userName, onLogout, activeTab, setActiveTab }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "vault", label: "Vault" },
    { id: "agent", label: "AI Agent" },
    { id: "logs", label: "History" },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <i className="fa-solid fa-graduation-cap text-white text-xl"></i>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">
            ClassMate AI
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col items-end text-sm">
            <span className="font-semibold text-slate-900">{userName}</span>
            <span className="text-slate-400 text-xs uppercase font-bold tracking-widest">
              Student
            </span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Logout"
          >
            <i className="fa-solid fa-right-from-bracket text-lg"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
