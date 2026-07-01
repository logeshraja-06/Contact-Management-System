import { Users, UserCheck, PhoneCall, Archive, Plus, Sun, Moon, X } from "lucide-react";

export default function Sidebar({
  isOpen,
  onClose,
  activeFilter,
  setActiveFilter,
  counts = { total: 0, Interested: 0, "Follow-up": 0, Closed: 0 },
  onAddClick,
  theme,
  toggleTheme,
}) {
  const menuItems = [
    { id: "", label: "All Contacts", icon: <Users className="w-5 h-5" />, color: "text-blue-500" },
    {
      id: "Interested",
      label: "Interested",
      icon: <UserCheck className="w-5 h-5" />,
      color: "text-amber-500",
    },
    {
      id: "Follow-up",
      label: "Follow-up",
      icon: <PhoneCall className="w-5 h-5" />,
      color: "text-indigo-500",
    },
    { id: "Closed", label: "Closed", icon: <Archive className="w-5 h-5" />, color: "text-emerald-500" },
  ];

  const getCount = (id) => {
    if (id === "") return counts.total;
    return counts[id] || 0;
  };

  const handleFilterClick = (id) => {
    setActiveFilter(id);
    if (onClose) onClose();
  };

  const handleAddClick = () => {
    onAddClick();
    if (onClose) onClose();
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 md:w-80 md:h-screen md:sticky md:top-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-md px-6 py-8 flex-shrink-0 transition-transform duration-300 ease-in-out ${
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    }`}>
      {/* Brand Logo */}
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Conex<span className="text-blue-500">.</span>
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Smart Contact CRM</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
          title="Close Sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Action Button */}
      <button
        onClick={handleAddClick}
        className="w-full mb-8 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer group"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        Add New Contact
      </button>

      {/* Navigation Filter List */}
      <nav className="flex-grow space-y-1">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">
          Categories
        </p>
        {menuItems.map((item) => {
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleFilterClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={item.color}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 group-hover:bg-white"
                }`}
              >
                {getCount(item.id)}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Theme Toggler footer */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6">
        <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl flex items-center gap-1">
          <button
            onClick={() => toggleTheme("light")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
              theme === "light"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-200"
            }`}
          >
            <Sun className="w-4 h-4" />
            Light
          </button>
          <button
            onClick={() => toggleTheme("dark")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
            }`}
          >
            <Moon className="w-4 h-4" />
            Dark
          </button>
        </div>
      </div>
    </aside>
  );
}
