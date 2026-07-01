import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Grid,
  List,
  Mail,
  Phone,
  Building,
  Edit2,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  Filter,
  Users,
  UserCheck,
  PhoneCall,
  Archive,
} from "lucide-react";
import { getLocalContacts, saveLocalContacts } from "../utils/localDB";

export default function ContactList({
  contacts,
  setContacts,
  activeFilter,
  setActiveFilter,
  search,
  setSearch,
  loading,
  setLoading,
  onEditClick,
  onDeleteClick,
  refreshTrigger,
  counts,
  isOffline,
}) {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("crm_view_mode") || "grid";
  });
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name-asc, name-desc, company-asc

  // Fetch filtered/searched contacts from backend or local storage
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      if (isOffline) {
        const local = getLocalContacts();
        let filtered = local;
        if (activeFilter) {
          filtered = filtered.filter((c) => c.status === activeFilter);
        }
        if (search) {
          const queryStr = search.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.name.toLowerCase().includes(queryStr) ||
              (c.company && c.company.toLowerCase().includes(queryStr))
          );
        }
        // Simulated latency for skeleton pulse loaders
        await new Promise((resolve) => setTimeout(resolve, 600));
        setContacts(filtered);
        setLoading(false);
        return;
      }

      const query = `?status=${activeFilter}&search=${search}`;
      try {
        const fetchPromise = axios.get(`http://localhost:5000/contacts${query}`);
        // Keep minimum 800ms delay for smooth transitions (as requested in demo spec)
        const delayPromise = new Promise((resolve) => setTimeout(resolve, 800));
        const [res] = await Promise.all([fetchPromise, delayPromise]);
        setContacts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [activeFilter, search, refreshTrigger, isOffline, setContacts, setLoading]);

  // Persist layout preference
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem("crm_view_mode", mode);
  };

  // Client-side sorting logic
  const getSortedContacts = () => {
    const sorted = [...contacts];
    if (sortBy === "newest") {
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sortBy === "oldest") {
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    if (sortBy === "name-asc") {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "name-desc") {
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    if (sortBy === "company-asc") {
      return sorted.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
    }
    return sorted;
  };

  // Helper: Name Initials
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper: Dynamic avatar gradients based on name hash
  const getAvatarGradient = (name) => {
    const gradients = [
      "from-blue-500 to-indigo-650 shadow-blue-500/10",
      "from-purple-500 to-fuchsia-600 shadow-purple-500/10",
      "from-pink-500 to-rose-600 shadow-pink-500/10",
      "from-amber-500 to-orange-600 shadow-amber-500/10",
      "from-emerald-500 to-teal-600 shadow-emerald-500/10",
      "from-cyan-500 to-blue-600 shadow-cyan-500/10",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  // Helper: Search Match Highlighting
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="search-highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Helper: Status badge style mapping
  const statusStyles = {
    Interested: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/30 dot-amber-500",
    "Follow-up": "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/30 dot-indigo-500",
    Closed: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30 dot-emerald-500",
  };

  const handleStatusChange = async (id, newStatus) => {
    if (isOffline) {
      const local = getLocalContacts();
      const updated = local.map((c) => (c._id === id ? { ...c, status: newStatus } : c));
      saveLocalContacts(updated);
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
      );
      window.dispatchEvent(new CustomEvent("contact-updated"));
      return;
    }

    try {
      await axios.put(`http://localhost:5000/contacts/${id}`, { status: newStatus });
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
      );
      window.dispatchEvent(new CustomEvent("contact-updated"));
    } catch (err) {
      console.error(err);
    }
  };

  const sortedContacts = getSortedContacts();

  return (
    <div className="space-y-8 flex-grow">
      {/* 1. Metrics / Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div
          onClick={() => setActiveFilter("")}
          className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-32 group ${
            activeFilter === ""
              ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/15"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:shadow-lg text-slate-800 dark:text-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`p-2.5 rounded-xl ${
                activeFilter === "" ? "bg-white/10 text-white" : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
              }`}
            >
              <Users className="w-5 h-5" />
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                activeFilter === "" ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              All
            </span>
          </div>
          <div>
            <h3 className={`text-2xl font-bold tracking-tight font-display`}>{counts.total}</h3>
            <p className={`text-xs font-medium mt-0.5 ${activeFilter === "" ? "text-blue-100" : "text-slate-400"}`}>
              Total Contacts
            </p>
          </div>
        </div>

        {/* Interested Card */}
        <div
          onClick={() => setActiveFilter("Interested")}
          className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-32 group ${
            activeFilter === "Interested"
              ? "bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/15"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:shadow-lg text-slate-800 dark:text-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`p-2.5 rounded-xl ${
                activeFilter === "Interested"
                  ? "bg-white/10 text-white"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
              }`}
            >
              <UserCheck className="w-5 h-5" />
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                activeFilter === "Interested"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              Leads
            </span>
          </div>
          <div>
            <h3 className={`text-2xl font-bold tracking-tight font-display`}>{counts.Interested}</h3>
            <p className={`text-xs font-medium mt-0.5 ${activeFilter === "Interested" ? "text-amber-50" : "text-slate-400"}`}>
              Interested
            </p>
          </div>
        </div>

        {/* Follow-up Card */}
        <div
          onClick={() => setActiveFilter("Follow-up")}
          className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-32 group ${
            activeFilter === "Follow-up"
              ? "bg-indigo-600 border-indigo-650 text-white shadow-xl shadow-indigo-500/15"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:shadow-lg text-slate-800 dark:text-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`p-2.5 rounded-xl ${
                activeFilter === "Follow-up"
                  ? "bg-white/10 text-white"
                  : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400"
              }`}
            >
              <PhoneCall className="w-5 h-5" />
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                activeFilter === "Follow-up"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              Active
            </span>
          </div>
          <div>
            <h3 className={`text-2xl font-bold tracking-tight font-display`}>{counts["Follow-up"]}</h3>
            <p className={`text-xs font-medium mt-0.5 ${activeFilter === "Follow-up" ? "text-indigo-50" : "text-slate-400"}`}>
              Follow-up Required
            </p>
          </div>
        </div>

        {/* Closed Card */}
        <div
          onClick={() => setActiveFilter("Closed")}
          className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-32 group ${
            activeFilter === "Closed"
              ? "bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/15"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:shadow-lg text-slate-800 dark:text-slate-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`p-2.5 rounded-xl ${
                activeFilter === "Closed"
                  ? "bg-white/10 text-white"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <Archive className="w-5 h-5" />
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                activeFilter === "Closed"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
            >
              Archive
            </span>
          </div>
          <div>
            <h3 className={`text-2xl font-bold tracking-tight font-display`}>{counts.Closed}</h3>
            <p className={`text-xs font-medium mt-0.5 ${activeFilter === "Closed" ? "text-emerald-50" : "text-slate-400"}`}>
              Closed Deals
            </p>
          </div>
        </div>
      </div>

      {/* 2. Workspace Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name or company..."
            className="pl-10 pr-12 py-2 rounded-xl w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded bg-slate-150 dark:bg-slate-800 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters, Sort & View Switches */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Sorting Select */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <ArrowUpDown className="w-4 h-4" />
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-8 py-2.2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
            >
              <option value="newest">Newest Leads</option>
              <option value="oldest">Oldest Leads</option>
              <option value="name-asc">Name (A - Z)</option>
              <option value="name-desc">Name (Z - A)</option>
              <option value="company-asc">Company (A - Z)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* View Toggles */}
          <div className="bg-slate-50 dark:bg-slate-950 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => toggleViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-650 dark:hover:text-slate-300"
              }`}
              title="Grid View"
            >
              <Grid className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => toggleViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-650 dark:hover:text-slate-300"
              }`}
              title="List/Table View"
            >
              <List className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Data Content Area */}
      {loading ? (
        /* Loading Skeleton Screens */
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-1/2" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-1/3" />
                  </div>
                </div>
                <div className="h-0.5 bg-slate-100/60 dark:bg-slate-800/40" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-32" />
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-28 flex-1 hidden sm:block" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-20" />
              </div>
            ))}
          </div>
        )
      ) : sortedContacts.length === 0 ? (
        /* Illustrated Empty State */
        <div className="w-full py-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/10">
          <div className="w-20 h-20 rounded-2xl bg-slate-105 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-4 animate-bounce">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">No leads found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mt-1 mb-6 leading-relaxed">
            We couldn't find any contacts matching your active filters or search terms.
          </p>
          {(activeFilter || search) && (
            <button
              onClick={() => {
                setActiveFilter("");
                setSearch("");
              }}
              className="px-4 py-2 text-xs font-semibold text-blue-650 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedContacts.map((contact) => (
            <div
              key={contact._id}
              className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-850 rounded-2xl p-5 hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                {/* Card Top: Avatar & Name */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                      contact.name
                    )} flex items-center justify-center text-white font-bold text-base shadow-sm`}
                  >
                    {getInitials(contact.name)}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0 pr-6">
                    <h3 className="font-semibold text-base text-slate-900 dark:text-slate-50 tracking-tight font-display truncate font-semibold">
                      {highlightText(contact.name, search)}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                      <Building className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {contact.company ? highlightText(contact.company, search) : "No Company"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

                {/* Card Body: Details */}
                <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-450 font-medium">
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors py-0.5 truncate"
                  >
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{contact.email}</span>
                  </a>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2.5 hover:text-blue-500 dark:hover:text-blue-400 transition-colors py-0.5"
                    >
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{contact.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Card Footer: Status Select & Actions */}
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="relative animate-fade-in">
                  <select
                    value={contact.status}
                    onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                    className={`pl-3 pr-7 py-1 rounded-full text-xs font-semibold border outline-none cursor-pointer appearance-none transition-all ${
                      statusStyles[contact.status]
                    }`}
                  >
                    <option value="Interested">Interested</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-slate-400">
                    ▼
                  </span>
                </div>

                {/* Actions (visible or highlighted on hover) */}
                <div className="flex gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => onEditClick(contact)}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-650 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900"
                    title="Edit Lead"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteClick(contact._id, contact.name)}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900"
                    title="Delete Lead"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View (Table Grid) */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-xs font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-6">Lead</th>
                  <th className="py-4 px-6 hidden md:table-cell">Company</th>
                  <th className="py-4 px-6 hidden sm:table-cell">Contact Info</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {sortedContacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors text-slate-700 dark:text-slate-300 text-sm align-middle group"
                  >
                    {/* Name avatar */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${getAvatarGradient(
                            contact.name
                          )} flex items-center justify-center text-white font-bold text-xs shadow-sm`}
                        >
                          {getInitials(contact.name)}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 font-display">
                          {highlightText(contact.name, search)}
                        </span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-6 font-medium text-xs hidden md:table-cell">
                      {contact.company ? (
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Building className="w-3.5 h-3.5" />
                          <span>{highlightText(contact.company, search)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Email / Phone */}
                    <td className="py-3.5 px-6 text-xs space-y-0.5 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Status Select */}
                    <td className="py-3.5 px-6">
                      <div className="relative inline-block">
                        <select
                          value={contact.status}
                          onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                          className={`pl-2.5 pr-6 py-0.5 rounded-full text-[11px] font-semibold border outline-none cursor-pointer appearance-none transition-all ${
                            statusStyles[contact.status]
                          }`}
                        >
                          <option value="Interested">Interested</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none text-slate-400">
                          ▼
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex gap-1.5 justify-end opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => onEditClick(contact)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-650 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(contact._id, contact.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
