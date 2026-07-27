import { useState, useEffect } from "react";
import API from "../services/api";
import {
  Crown,
  User,
  Lock,
  Pencil,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [profileMsg, setProfileMsg] = useState({ text: "", ok: true });
  const [pwMsg, setPwMsg] = useState({ text: "", ok: true });
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  // ── load profile ────────────────────────────────────────────────
  const loadProfile = () => {
    API.get("/profile")
      .then((res) => {
        setProfile(res.data);
        setForm({ full_name: res.data.full_name, phone: res.data.phone || "" });
      })
      .catch(() => setProfileMsg({ text: "Failed to load profile", ok: false }));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ── save profile ─────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!form.full_name.trim() || !form.phone.trim()) {
      setProfileMsg({ text: "Name and phone cannot be empty", ok: false });
      return;
    }
    setSaving(true);
    try {
      const res = await API.put("/profile/update", form);
      setProfileMsg({ text: res.data.message, ok: true });
      setEditMode(false);
      loadProfile();
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || "Update failed",
        ok: false,
      });
    } finally {
      setSaving(false);
      setTimeout(() => setProfileMsg({ text: "", ok: true }), 3000);
    }
  };

  // ── change password ───────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!pwForm.current_password || !pwForm.new_password || !pwForm.confirm_password) {
      setPwMsg({ text: "All password fields are required", ok: false });
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwMsg({ text: "New passwords do not match", ok: false });
      return;
    }
    if (pwForm.new_password.length < 6) {
      setPwMsg({ text: "New password must be at least 6 characters", ok: false });
      return;
    }
    setSaving(true);
    try {
      const res = await API.put("/profile/change-password", {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwMsg({ text: res.data.message, ok: true });
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPwMsg({
        text: err.response?.data?.message || "Password change failed",
        ok: false,
      });
    } finally {
      setSaving(false);
      setTimeout(() => setPwMsg({ text: "", ok: true }), 3000);
    }
  };

  // ── helpers ───────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const togglePw = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  // ── render ────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="pt-28 min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="t-text-muted text-lg animate-pulse">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="pt-28 px-6 md:px-12 lg:px-20 t-bg-base min-h-screen t-text pb-16">
      <div className="max-w-3xl mx-auto">

        {/* ── Header card ── */}
        <div className="t-card rounded-2xl p-6 mb-6 flex items-center gap-5">
          {/* Avatar circle with initials */}
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900 text-2xl font-bold shrink-0">
            {getInitials(profile.full_name)}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{profile.full_name}</h1>
            <p className="t-text-muted text-sm truncate">{profile.email}</p>
            <span
              className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${
                profile.role === "admin"
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-emerald-500/15 text-emerald-400"
              }`}
            >
              {profile.role === "admin" ? (
                <span className="inline-flex items-center gap-1"><Crown size={12} />Admin</span>
              ) : (
                <span className="inline-flex items-center gap-1"><User size={12} />User</span>
              )}
            </span>
          </div>

          <div className="text-right text-xs text-slate-500 shrink-0">
            <p>Member since</p>
            <p className="t-text font-medium">{formatDate(profile.created_at)}</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6">
          {["profile", "password"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setEditMode(false); }}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-emerald-500 text-slate-900"
                  : "bg-slate-800 t-text-muted hover:text-slate-100 border t-border"
              }`}
            >
              {tab === "profile" ? (
                <span className="inline-flex items-center gap-1.5"><User size={14} />Profile Info</span>
              ) : (
                <span className="inline-flex items-center gap-1.5"><Lock size={14} />Change Password</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="t-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Personal Information</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-1.5"
                >
                  <Pencil size={14} />Edit
                </button>
              )}
            </div>

            {/* View mode */}
            {!editMode ? (
              <div className="space-y-4">
                {[
                  { label: "Full Name", value: profile.full_name, icon: User },
                  { label: "Email Address", value: profile.email, icon: Mail },
                  { label: "Phone Number", value: profile.phone || "Not provided", icon: Phone },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 bg-slate-700/50 rounded-xl px-4 py-3"
                  >
                    <Icon size={20} />
                    <div>
                      <p className="text-xs t-text-muted">{label}</p>
                      <p className="text-slate-100 font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Edit mode */
              <div className="space-y-4">
                <div>
                  <label className="text-xs t-text-muted mb-1 block">Full Name</label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full t-input focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="text-xs t-text-muted mb-1 block">Email Address</label>
                  <input
                    value={profile.email}
                    disabled
                    className="w-full bg-slate-700/50 border border-slate-600 text-slate-500 p-3 rounded-xl cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="text-xs t-text-muted mb-1 block">Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full t-input focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Your phone number"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold rounded-xl transition-all disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setForm({ full_name: profile.full_name, phone: profile.phone || "" });
                      setProfileMsg({ text: "", ok: true });
                    }}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Profile message */}
            {profileMsg.text && (
              <p
                className={`mt-4 text-sm font-medium ${
                  profileMsg.ok ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {profileMsg.ok ? <CheckCircle2 size={16} className="inline mr-1" /> : <XCircle size={16} className="inline mr-1" />}{profileMsg.text}
              </p>
            )}
          </div>
        )}

        {/* ── Password Tab ── */}
        {activeTab === "password" && (
          <div className="t-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-6">Change Password</h2>

            <div className="space-y-4">
              {/* Current password */}
              <div>
                <label className="text-xs t-text-muted mb-1 block">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={pwForm.current_password}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, current_password: e.target.value })
                    }
                    placeholder="Enter current password"
                    className="w-full t-input text-white p-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePw("current")}
                    className="absolute right-3 top-3 t-text-muted hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="text-xs t-text-muted mb-1 block">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={pwForm.new_password}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, new_password: e.target.value })
                    }
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full t-input text-white p-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePw("new")}
                    className="absolute right-3 top-3 t-text-muted hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm new password */}
              <div>
                <label className="text-xs t-text-muted mb-1 block">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={pwForm.confirm_password}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, confirm_password: e.target.value })
                    }
                    placeholder="Re-enter new password"
                    className="w-full t-input text-white p-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => togglePw("confirm")}
                    className="absolute right-3 top-3 t-text-muted hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Live match indicator */}
                {pwForm.confirm_password && (
                  <p
                    className={`text-xs mt-1 ${
                      pwForm.new_password === pwForm.confirm_password
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {pwForm.new_password === pwForm.confirm_password ? (
                      <span className="inline-flex items-center gap-1"><CheckCircle2 size={12} />Passwords match</span>
                    ) : (
                      <span className="inline-flex items-center gap-1"><XCircle size={12} />Passwords do not match</span>
                    )}
                  </p>
                )}
              </div>

              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold rounded-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-60"
              >
                {saving ? "Updating…" : "Update Password"}
              </button>
            </div>

            {/* Password message */}
            {pwMsg.text && (
              <p
                className={`mt-4 text-sm font-medium ${
                  pwMsg.ok ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {pwMsg.ok ? <CheckCircle2 size={16} className="inline mr-1" /> : <XCircle size={16} className="inline mr-1" />}{pwMsg.text}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
