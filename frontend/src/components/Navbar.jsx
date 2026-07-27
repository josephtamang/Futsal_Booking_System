import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun, Menu, Settings as SettingsIcon, Bot } from "lucide-react";

function getRole(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).role || "user";
  } catch { return "user"; }
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <span className="theme-toggle-thumb">
        {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
      </span>
    </button>
  );
}

function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const role = token ? getRole(token) : null;
  const isAdmin = role === "admin";

  const handleLogout = () => { logout(); navigate("/login"); };
  const close = () => setOpen(false);

  const linkCls = "transition-colors duration-150 hover:text-emerald-400";

  return (
    <nav className="t-navbar fixed top-0 left-0 w-full px-6 py-3.5 shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold t-text hover:text-emerald-400 transition shrink-0 inline-flex items-center gap-1.5">
          <span className="text-xl" role="img" aria-label="football">⚽</span> RinCon FutBuk
        </Link>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button className="t-text" onClick={() => setOpen(!open)}><Menu size={24} /></button>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium t-text">
          <Link to="/" className={linkCls}>Home</Link>
          <Link to="/about" className={linkCls}>About</Link>
          <Link to="/contact" className={linkCls}>Contact</Link>

          {!token ? (
            <>
              <Link to="/login" className={linkCls}>Login</Link>
              <Link to="/register"
                className="px-4 py-1.5 rounded-lg font-semibold transition"
                style={{ background: "var(--accent)", color: "#0f172a" }}
              >Register</Link>
            </>
          ) : isAdmin ? (
            <>
              <Link to="/admin" className={linkCls}>Dashboard</Link>
              <Link to="/admin/courts" className={linkCls}>Courts</Link>
              <Link to="/admin/slots" className={linkCls}>Slots</Link>
              <Link to="/admin/settings"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc" }}
              ><SettingsIcon size={12} className="inline mr-1" />Settings</Link>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition">Logout</button>
            </>
          ) : (
            <>
              <Link to="/recommendations" className={`${linkCls} inline-flex items-center gap-1`}><Bot size={14} />AI Pick</Link>
              <Link to="/explore" className={linkCls}>Book Futsal</Link>
              <Link to="/my-bookings" className={linkCls}>My Bookings</Link>
              <Link to="/profile" className={linkCls}>My Profile</Link>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition">Logout</button>
            </>
          )}

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-3 pb-3 flex flex-col gap-3 text-sm font-medium t-text border-t t-border pt-3">
          <Link onClick={close} to="/" className={linkCls}>Home</Link>
          <Link onClick={close} to="/about" className={linkCls}>About</Link>
          <Link onClick={close} to="/contact" className={linkCls}>Contact</Link>

          {!token ? (
            <>
              <Link onClick={close} to="/login" className={linkCls}>Login</Link>
              <Link onClick={close} to="/register" className={linkCls}>Register</Link>
            </>
          ) : isAdmin ? (
            <>
              <Link onClick={close} to="/admin" className={linkCls}>Dashboard</Link>
              <Link onClick={close} to="/admin/courts" className={linkCls}>Courts</Link>
              <Link onClick={close} to="/admin/slots" className={linkCls}>Slots</Link>
              <Link onClick={close} to="/admin/settings" className={`${linkCls} inline-flex items-center gap-1`}><SettingsIcon size={12} />Settings</Link>
              <button onClick={handleLogout} className="text-red-400 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link onClick={close} to="/recommendations" className={`${linkCls} inline-flex items-center gap-1`}><Bot size={14} />AI Pick</Link>
              <Link onClick={close} to="/explore" className={linkCls}>Book Futsal</Link>
              <Link onClick={close} to="/my-bookings" className={linkCls}>My Bookings</Link>
              <Link onClick={close} to="/profile" className={linkCls}>My Profile</Link>
              <button onClick={handleLogout} className="text-red-400 text-left">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
