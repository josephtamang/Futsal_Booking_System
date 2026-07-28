import { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart3,
  Users,
  Building2,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Trophy,
  Clock,
  Search,
  Crown,
  Ban,
  Pencil,
  Trash2,
  Mail,
} from "lucide-react";

// ─── tiny helpers ──────────────────────────────────────────────────────────
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const StatCard = ({ icon: Icon, label, value, color = "emerald" }) => {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    slate: "bg-slate-700/50 t-text border-slate-600",
  };
  return (
    <div
      className={`rounded-2xl border p-5 flex items-center gap-4 ${colors[color]}`}
    >
      <Icon size={28} />
      <div>
        <p className="text-xs opacity-70 mb-0.5">{label}</p>
        <p className="text-2xl font-bold">{value ?? "—"}</p>
      </div>
    </div>
  );
};

// ─── main component ────────────────────────────────────────────────────────
function AdminSettings() {
  const [activeTab, setActiveTab] = useState("reports");

  // ── Reports ──
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Users ──
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [userMsg, setUserMsg] = useState({ text: "", ok: true });

  // â”€â”€ Messages â”€â”€
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageMsg, setMessageMsg] = useState({ text: "", ok: true });

  // ── Futsals ──
  const [futsals, setFutsals] = useState([]);
  const [editFutsal, setEditFutsal] = useState(null); // futsal being edited
  const [futsalForm, setFutsalForm] = useState({
    futsal_name: "",
    address: "",
    opening_time: "",
    closing_time: "",
  });
  const [futsalMsg, setFutsalMsg] = useState({ text: "", ok: true });
  const [futsalLoading, setFutsalLoading] = useState(false);

  // ── load on tab switch ──────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "reports") loadStats();
    if (activeTab === "users") loadUsers();
    if (activeTab === "messages") loadMessages();
    if (activeTab === "futsals") loadFutsals();
  }, [activeTab]);

  // ── STATS ───────────────────────────────────────────────────────────────
  const loadStats = () => {
    setStatsLoading(true);
    API.get("/admin-settings/stats")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  };

  // ── USERS ───────────────────────────────────────────────────────────────
  const loadUsers = () => {
    setUserLoading(true);
    API.get("/admin-settings/users")
      .then((res) => setUsers(res.data))
      .catch(() => setUserMsg({ text: "Failed to load users", ok: false }))
      .finally(() => setUserLoading(false));
  };

  const handleUserToggle = (user_id, currentRole) => {
    const isActive = currentRole !== "banned";
    const endpoint = isActive ? "deactivate" : "activate";
    const label = isActive ? "deactivate" : "activate";

    if (!window.confirm(`Are you sure you want to ${label} this user?`)) return;

    API.put(`/admin-settings/users/${user_id}/${endpoint}`)
      .then((res) => {
        setUserMsg({ text: res.data.message, ok: true });
        loadUsers();
      })
      .catch((err) =>
        setUserMsg({
          text: err.response?.data?.message || "Action failed",
          ok: false,
        })
      )
      .finally(() => setTimeout(() => setUserMsg({ text: "", ok: true }), 3000));
  };

  const filteredUsers = users.filter((u) => {
    const name = u.full_name || "";
    const email = u.email || "";
    const search = userSearch.toLowerCase();

    return (
      name.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search)
    );
  });

  // â”€â”€ MESSAGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadMessages = () => {
    setMessageLoading(true);
    setMessageMsg({ text: "", ok: true });

    API.get("/contact")
      .then((res) => setMessages(res.data))
      .catch(() =>
        setMessageMsg({ text: "Failed to load contact messages", ok: false })
      )
      .finally(() => setMessageLoading(false));
  };

  // ── FUTSALS ─────────────────────────────────────────────────────────────
  const loadFutsals = () => {
    setFutsalLoading(true);
    API.get("/admin-settings/futsals")
      .then((res) => setFutsals(res.data))
      .catch(() => setFutsalMsg({ text: "Failed to load futsals", ok: false }))
      .finally(() => setFutsalLoading(false));
  };

  const startEditFutsal = (f) => {
    setEditFutsal(f.futsal_id);
    setFutsalForm({
      futsal_name: f.futsal_name,
      address: f.address,
      opening_time: f.opening_time || "",
      closing_time: f.closing_time || "",
    });
    setFutsalMsg({ text: "", ok: true });
  };

  const cancelEditFutsal = () => {
    setEditFutsal(null);
    setFutsalForm({ futsal_name: "", address: "", opening_time: "", closing_time: "" });
  };

  const saveFutsal = (futsal_id) => {
    if (!futsalForm.futsal_name.trim() || !futsalForm.address.trim()) {
      setFutsalMsg({ text: "Name and address are required", ok: false });
      return;
    }
    API.put(`/admin-settings/futsals/${futsal_id}`, futsalForm)
      .then((res) => {
        setFutsalMsg({ text: res.data.message, ok: true });
        setEditFutsal(null);
        loadFutsals();
      })
      .catch((err) =>
        setFutsalMsg({
          text: err.response?.data?.message || "Update failed",
          ok: false,
        })
      )
      .finally(() => setTimeout(() => setFutsalMsg({ text: "", ok: true }), 3500));
  };

  const deleteFutsal = (futsal_id, name) => {
    if (
      !window.confirm(
        `Delete "${name}"? This will also remove all its courts and slots.`
      )
    )
      return;
    API.delete(`/admin-settings/futsals/${futsal_id}`)
      .then((res) => {
        setFutsalMsg({ text: res.data.message, ok: true });
        loadFutsals();
      })
      .catch((err) =>
        setFutsalMsg({
          text: err.response?.data?.message || "Delete failed",
          ok: false,
        })
      )
      .finally(() => setTimeout(() => setFutsalMsg({ text: "", ok: true }), 3000));
  };

  // ── render ───────────────────────────────────────────────────────────────
  const tabs = [
    { key: "reports", label: "Reports", icon: BarChart3 },
    { key: "users",   label: "Manage Users", icon: Users },
    { key: "messages", label: "Messages", icon: Mail },
    { key: "futsals", label: "Manage Futsals", icon: Building2 },
  ];

  return (
    <div className="pt-28 px-6 md:px-12 lg:px-20 t-bg-base min-h-screen t-text pb-16">
      <div className="max-w-6xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="t-text-muted mt-1">Manage users, futsals, and view system reports</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2 ${
                activeTab === t.key
                  ? "bg-emerald-500 text-slate-900"
                  : "bg-slate-800 t-text-muted hover:text-slate-100 border t-border"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── REPORTS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "reports" && (
          <div>
            {statsLoading ? (
              <p className="t-text-muted animate-pulse">Loading stats…</p>
            ) : !stats ? (
              <p className="text-red-400">Failed to load stats.</p>
            ) : (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                  <StatCard icon={User}        label="Total Users"      value={stats.totalUsers}         color="blue"    />
                  <StatCard icon={Calendar}    label="Total Bookings"   value={stats.totalBookings}      color="emerald" />
                  <StatCard icon={CheckCircle2} label="Confirmed"       value={stats.confirmedBookings}  color="emerald" />
                  <StatCard icon={XCircle}     label="Cancelled"        value={stats.cancelledBookings}  color="red"     />
                  <StatCard icon={Building2}   label="Futsals"          value={stats.totalFutsals}       color="purple"  />
                  <StatCard icon={LayoutGrid}  label="Courts"           value={stats.totalCourts}        color="amber"   />
                </div>

                {/* Two columns: top futsals + recent bookings */}
                <div className="grid md:grid-cols-2 gap-6">

                  {/* Top Futsals */}
                  <div className="t-card rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4 inline-flex items-center gap-2"><Trophy size={18} />Top Futsals by Bookings</h2>
                    {stats.topFutsals?.length === 0 ? (
                      <p className="t-text-muted text-sm">No data yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.topFutsals?.map((f, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-700/50 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-emerald-400 font-bold text-sm w-5">
                                #{i + 1}
                              </span>
                              <span className="font-medium text-sm">{f.futsal_name}</span>
                            </div>
                            <span className="text-sm t-text-muted">
                              {f.total_bookings} bookings
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Bookings */}
                  <div className="t-card rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4 inline-flex items-center gap-2"><Clock size={18} />Recent Bookings</h2>
                    {stats.recentBookings?.length === 0 ? (
                      <p className="t-text-muted text-sm">No bookings yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.recentBookings?.map((b, i) => (
                          <div key={i} className="bg-slate-700/50 rounded-xl px-4 py-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{b.full_name}</p>
                                <p className="t-text-muted text-xs">
                                  {b.futsal_name} — {b.court_name}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs t-text-muted">{fmt(b.booking_date)}</p>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                    b.status === "confirmed"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-red-500/20 text-red-400"
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── USERS TAB ───────────────────────────────────────────────────── */}
        {activeTab === "users" && (
          <div>
            {/* Search */}
            <div className="mb-5 relative w-full md:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 t-text-muted" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full t-input text-white p-3 pl-9 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {userMsg.text && (
              <p className={`mb-4 text-sm font-medium inline-flex items-center gap-1.5 ${userMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                {userMsg.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {userMsg.text}
              </p>
            )}

            {userLoading ? (
              <p className="t-text-muted animate-pulse">Loading users…</p>
            ) : (
              <div className="t-card rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700/80">
                    <tr>
                      <th className="p-4 text-left font-semibold">Name</th>
                      <th className="p-4 text-left font-semibold hidden md:table-cell">Email</th>
                      <th className="p-4 text-left font-semibold hidden md:table-cell">Phone</th>
                      <th className="p-4 text-left font-semibold">Role</th>
                      <th className="p-4 text-left font-semibold hidden md:table-cell">Joined</th>
                      <th className="p-4 text-center font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center t-text-muted">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.user_id} className="border-t t-border hover:bg-slate-700/30 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                                {(u.full_name || "U")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <span className="font-medium">{u.full_name || "Unnamed User"}</span>
                            </div>
                          </td>
                          <td className="p-4 t-text-muted hidden md:table-cell">{u.email || "—"}</td>
                          <td className="p-4 t-text-muted hidden md:table-cell">{u.phone || "—"}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                u.role === "admin"
                                  ? "bg-purple-500/20 text-purple-400"
                                  : u.role === "banned"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-emerald-500/15 text-emerald-400"
                              }`}
                            >
                              {u.role === "admin" ? (
                                <span className="inline-flex items-center gap-1"><Crown size={12} />Admin</span>
                              ) : u.role === "banned" ? (
                                <span className="inline-flex items-center gap-1"><Ban size={12} />Banned</span>
                              ) : (
                                <span className="inline-flex items-center gap-1"><User size={12} />User</span>
                              )}
                            </span>
                          </td>
                          <td className="p-4 t-text-muted hidden md:table-cell">{fmt(u.created_at)}</td>
                          <td className="p-4 text-center">
                            {u.role === "admin" ? (
                              <span className="text-slate-600 text-xs">—</span>
                            ) : u.role === "banned" ? (
                              <button
                                onClick={() => handleUserToggle(u.user_id, u.role)}
                                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-xs font-semibold transition"
                              >
                                Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserToggle(u.user_id, u.role)}
                                className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-semibold transition"
                              >
                                Deactivate
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── FUTSALS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "messages" && (
          <div>
            {messageMsg.text && (
              <p className={`mb-4 text-sm font-medium inline-flex items-center gap-1.5 ${messageMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                {messageMsg.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {messageMsg.text}
              </p>
            )}

            {messageLoading ? (
              <p className="t-text-muted animate-pulse">Loading messagesâ€¦</p>
            ) : messages.length === 0 ? (
              <div className="t-card rounded-2xl p-8 text-center">
                <Mail size={32} className="mx-auto mb-3 t-text-muted" />
                <p className="t-text-muted">No contact messages yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className="t-card rounded-2xl p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{m.name || "Unnamed User"}</h3>
                        <a
                          href={`mailto:${m.email}`}
                          className="text-sm text-emerald-400 hover:underline"
                        >
                          {m.email || "No email"}
                        </a>
                      </div>
                      <span className="text-xs t-text-muted">
                        {fmt(m.created_at)}
                      </span>
                    </div>
                    <p className="t-text-muted leading-relaxed whitespace-pre-wrap">
                      {m.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "futsals" && (
          <div>
            {futsalMsg.text && (
              <p className={`mb-4 text-sm font-medium inline-flex items-center gap-1.5 ${futsalMsg.ok ? "text-emerald-400" : "text-red-400"}`}>
                {futsalMsg.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {futsalMsg.text}
              </p>
            )}

            {futsalLoading ? (
              <p className="t-text-muted animate-pulse">Loading futsals…</p>
            ) : futsals.length === 0 ? (
              <p className="t-text-muted">No futsals found.</p>
            ) : (
              <div className="space-y-4">
                {futsals.map((f) => (
                  <div
                    key={f.futsal_id}
                    className="t-card rounded-2xl p-6"
                  >
                    {editFutsal === f.futsal_id ? (
                      /* ── Edit form ── */
                      <div>
                        <h3 className="font-semibold mb-4 inline-flex items-center gap-2"><Pencil size={16} />Editing: {f.futsal_name}</h3>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-xs t-text-muted mb-1 block">Futsal Name</label>
                            <input
                              value={futsalForm.futsal_name}
                              onChange={(e) => setFutsalForm({ ...futsalForm, futsal_name: e.target.value })}
                              className="w-full t-input focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs t-text-muted mb-1 block">Address</label>
                            <input
                              value={futsalForm.address}
                              onChange={(e) => setFutsalForm({ ...futsalForm, address: e.target.value })}
                              className="w-full t-input focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs t-text-muted mb-1 block">Opening Time</label>
                            <input
                              type="time"
                              value={futsalForm.opening_time}
                              onChange={(e) => setFutsalForm({ ...futsalForm, opening_time: e.target.value })}
                              className="w-full t-input focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs t-text-muted mb-1 block">Closing Time</label>
                            <input
                              type="time"
                              value={futsalForm.closing_time}
                              onChange={(e) => setFutsalForm({ ...futsalForm, closing_time: e.target.value })}
                              className="w-full t-input focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => saveFutsal(f.futsal_id)}
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold rounded-xl transition"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={cancelEditFutsal}
                            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm font-medium transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── View row ── */
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{f.futsal_name}</h3>
                            <p className="t-text-muted text-sm">{f.address || "No address"}</p>
                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                              {f.opening_time && (
                                <span className="inline-flex items-center gap-1"><Clock size={12} />{f.opening_time} – {f.closing_time}</span>
                              )}
                              <span className="inline-flex items-center gap-1"><LayoutGrid size={12} />{f.court_count} court{f.court_count !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => startEditFutsal(f)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm font-medium transition inline-flex items-center gap-1.5"
                          >
                            <Pencil size={14} />Edit
                          </button>
                          <button
                            onClick={() => deleteFutsal(f.futsal_id, f.futsal_name)}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition inline-flex items-center gap-1.5"
                          >
                            <Trash2 size={14} />Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminSettings;
