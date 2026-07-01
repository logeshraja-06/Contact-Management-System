import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import ContactForm from "./components/ContactForm";
import ContactList from "./components/ContactList";
import CustomModal from "./components/CustomModal";
import ToastContainer from "./components/Toast";
import { getLocalContacts, saveLocalContacts } from "./utils/localDB";
import { Menu, Plus, Users } from "lucide-react";

export default function App() {
  // Navigation & Workspace states
  const [contacts, setContacts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Network State
  const [isOffline, setIsOffline] = useState(false);

  // Form Drawer states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);

  // Delete Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState(null);
  const [deleteContactName, setDeleteContactName] = useState("");

  // Toast Alerts states
  const [toasts, setToasts] = useState([]);

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mobile navbar scroll tracking
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollTop = useRef(0);

  // Theme states
  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("crm_theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  });

  // Sync theme class to html node
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("crm_theme", theme);
  }, [theme]);

  // Statistics counts state
  const [counts, setCounts] = useState({
    total: 0,
    Interested: 0,
    "Follow-up": 0,
    Closed: 0,
  });

  // Fetch full stats count from database or local fallback
  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/contacts");
      const all = res.data;
      setIsOffline(false);
      setCounts({
        total: all.length,
        Interested: all.filter((c) => c.status === "Interested").length,
        "Follow-up": all.filter((c) => c.status === "Follow-up").length,
        Closed: all.filter((c) => c.status === "Closed").length,
      });
    } catch (err) {
      console.warn("Backend server unreachable. Falling back to offline client-side storage.", err);
      setIsOffline(true);
      const all = getLocalContacts();
      setCounts({
        total: all.length,
        Interested: all.filter((c) => c.status === "Interested").length,
        "Follow-up": all.filter((c) => c.status === "Follow-up").length,
        Closed: all.filter((c) => c.status === "Closed").length,
      });
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  // Listen to status change updates from ContactList or form
  useEffect(() => {
    const handleUpdate = () => {
      fetchStats();
    };
    window.addEventListener("contact-updated", handleUpdate);
    return () => window.removeEventListener("contact-updated", handleUpdate);
  }, []);

  // Show Toast alert when offline mode is activated on startup
  useEffect(() => {
    if (isOffline) {
      addToast("Running in Local Demo Mode (database offline).", "info");
    }
  }, [isOffline]);

  // Toast Helpers
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Form Drawer handlers
  const handleOpenAddForm = () => {
    setEditContact(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (contact) => {
    setEditContact(contact);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditContact(null);
    setRefreshTrigger((prev) => prev + 1); // reload list & stats
  };

  // Custom Confirmation Dialog handlers
  const handleTriggerDelete = (id, name) => {
    setDeleteContactId(id);
    setDeleteContactName(name);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteContactId) return;
    if (isOffline) {
      const local = getLocalContacts();
      const updated = local.filter((c) => c._id !== deleteContactId);
      saveLocalContacts(updated);
      setContacts((prev) => prev.filter((c) => c._id !== deleteContactId));
      setRefreshTrigger((prev) => prev + 1);
      addToast(`Contact "${deleteContactName}" has been deleted locally.`, "success");
      setIsModalOpen(false);
      setDeleteContactId(null);
      setDeleteContactName("");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/contacts/${deleteContactId}`);
      setContacts((prev) => prev.filter((c) => c._id !== deleteContactId));
      setRefreshTrigger((prev) => prev + 1); // refresh statistics
      addToast(`Contact "${deleteContactName}" has been deleted.`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to delete contact.", "error");
    } finally {
      setIsModalOpen(false);
      setDeleteContactId(null);
      setDeleteContactName("");
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    // Debounce/threshold of 8px to prevent jittering on mobile inertia scrolls
    if (Math.abs(lastScrollTop.current - scrollTop) > 8) {
      if (scrollTop > lastScrollTop.current && scrollTop > 60) {
        setIsNavbarVisible(false);
      } else {
        setIsNavbarVisible(true);
      }
    }
    lastScrollTop.current = scrollTop;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        counts={counts}
        onAddClick={handleOpenAddForm}
        theme={theme}
        toggleTheme={setTheme}
      />

      {/* Sidebar mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Workspace Dashboard */}
      <main onScroll={handleScroll} className="flex-grow h-screen overflow-y-auto px-4 md:px-10 py-6 md:py-8 flex flex-col">
        {/* Mobile Top Header */}
        <div className={`flex md:hidden items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-6 mb-6 shadow-xs sticky top-0 z-30 transition-all duration-300 ease-in-out ${
          isNavbarVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
            title="Open Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white font-display">
              Conex.
            </span>
            {isOffline && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" title="Local Demo Mode (Offline)" />
            )}
          </div>
          <button
            onClick={handleOpenAddForm}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 cursor-pointer"
            title="Add Lead"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Header */}
        <div className="hidden md:flex items-center justify-between pb-6 mb-8 border-b border-slate-200/60 dark:border-slate-800/80">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Contacts Workspace
            </h2>
            <p className="text-xs font-medium text-slate-450 dark:text-slate-500 mt-1">
              Add leads, monitor CRM status, and coordinate outreach.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isOffline && (
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-250 dark:border-amber-900/40 px-2.5 py-1 rounded-full animate-pulse">
                Local Demo Mode
              </span>
            )}
            <div className="text-xs font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3.5 py-1.5 rounded-xl shadow-xs">
              Conex CRM v1.0.0
            </div>
          </div>
        </div>

        {/* Dynamic Contacts Panel */}
        <ContactList
          contacts={contacts}
          setContacts={setContacts}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          search={search}
          setSearch={setSearch}
          loading={loading}
          setLoading={setLoading}
          onEditClick={handleOpenEditForm}
          onDeleteClick={handleTriggerDelete}
          refreshTrigger={refreshTrigger}
          counts={counts}
          isOffline={isOffline}
        />
      </main>

      {/* Slide-over Form Drawer */}
      <ContactForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editContact={editContact}
        setContacts={setContacts}
        contacts={contacts}
        addToast={addToast}
        isOffline={isOffline}
      />

      {/* Custom Confirmation Dialog Modal */}
      <CustomModal
        isOpen={isModalOpen}
        title="Delete Contact Profile?"
        message={`Are you sure you want to permanently delete lead ${deleteContactName}? This profile metadata cannot be recovered.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Toast Notification HUD */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}