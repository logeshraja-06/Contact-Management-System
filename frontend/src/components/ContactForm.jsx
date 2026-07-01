import { useState, useEffect } from "react";
import axios from "axios";
import { X, Loader2, User, Building, Mail, Phone, Tag } from "lucide-react";
import { getLocalContacts, saveLocalContacts } from "../utils/localDB";

export default function ContactForm({
  isOpen,
  onClose,
  editContact,
  setContacts,
  contacts,
  addToast,
  isOffline,
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Interested");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editContact) {
      setName(editContact.name || "");
      setCompany(editContact.company || "");
      setEmail(editContact.email || "");
      setPhone(editContact.phone || "");
      setStatus(editContact.status || "Interested");
    } else {
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setStatus("Interested");
    }
    setErrors({});
  }, [editContact, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    
    // Offline local fallback flow
    if (isOffline) {
      const local = getLocalContacts();
      if (editContact) {
        // Edit contact locally
        const updated = local.map((c) =>
          c._id === editContact._id
            ? { ...c, name, company, email, phone, status }
            : c
        );
        saveLocalContacts(updated);
        setContacts(contacts.map((c) => (c._id === editContact._id ? { ...c, name, company, email, phone, status } : c)));
        addToast(`Lead "${name}" updated locally!`, "success");
      } else {
        // Add contact locally
        const newContact = {
          _id: "local_" + Date.now(),
          name,
          company,
          email,
          phone,
          status,
          createdAt: new Date().toISOString(),
        };
        saveLocalContacts([newContact, ...local]);
        setContacts([newContact, ...contacts]);
        addToast(`Lead "${name}" created locally!`, "success");
      }
      setLoading(false);
      onClose();
      // Dispatch custom event to refresh count stats
      window.dispatchEvent(new CustomEvent("contact-updated"));
      return;
    }

    // Online database flow
    try {
      if (editContact) {
        const res = await axios.put(`http://localhost:5000/contacts/${editContact._id}`, {
          name,
          company,
          email,
          phone,
          status,
        });
        setContacts(contacts.map((c) => (c._id === editContact._id ? res.data : c)));
        addToast("Contact updated successfully!", "success");
      } else {
        const res = await axios.post("http://localhost:5000/contacts", {
          name,
          company,
          email,
          phone,
          status,
        });
        setContacts([res.data, ...contacts]);
        addToast("Contact created successfully!", "success");
      }
      onClose();
      window.dispatchEvent(new CustomEvent("contact-updated"));
    } catch (err) {
      console.error(err);
      addToast(
        err.response?.data?.error || "An error occurred while saving the contact.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between z-10 animate-drawer-in">
        {/* Scrollable Form Content */}
        <div className="flex-grow overflow-y-auto mb-6 pr-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                {editContact ? "Edit Contact" : "Add New Contact"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {editContact ? "Modify contact information." : "Create a new CRM lead profile."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form id="contact-form" onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`pl-10 pr-4 py-2.5 rounded-xl w-full bg-slate-50 dark:bg-slate-950 border text-slate-950 dark:text-slate-50 text-sm outline-none transition-all ${
                    errors.name
                      ? "border-rose-500 ring-1 ring-rose-500"
                      : "border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name}</p>}
            </div>

            {/* Company Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Company / Organization
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Building className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  className="pl-10 pr-4 py-2.5 rounded-xl w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-50 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className={`pl-10 pr-4 py-2.5 rounded-xl w-full bg-slate-50 dark:bg-slate-950 border text-slate-950 dark:text-slate-50 text-sm outline-none transition-all ${
                    errors.email
                      ? "border-rose-500 ring-1 ring-rose-500"
                      : "border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email}</p>}
            </div>

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="pl-10 pr-4 py-2.5 rounded-xl w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-50 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Lead Status
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Tag className="w-4 h-4" />
                </span>
                <select
                  value={status}
                  className="pl-10 pr-4 py-2.5 rounded-xl w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-50 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer appearance-none animate-fade-in"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Interested">Interested</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Closed">Closed</option>
                </select>
                <span className="absolute inset-y-0 right-4 flex items-center text-slate-400 pointer-events-none">
                  ▼
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex gap-3 animate-fade-in">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="contact-form"
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 active:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {editContact ? "Save Changes" : "Create Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}
