import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [open, setOpen] = useState(false);

  // Logout
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // If admin, use AdminNavbar instead
  if (role === "admin") return null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900 text-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* LOGO */}
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold cursor-pointer text-emerald-400"
        >
          FutBuk
        </h1>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>

          {token && (
            <>
              <Link to="/explore">Futsal Explorer</Link>
              <Link to="/my-bookings">My Bookings</Link>
              <button onClick={logout} className="text-red-400">
                Logout
              </button>
            </>
          )}

          {!token && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-slate-800 px-6 py-4 space-y-3">
          <Link onClick={() => setOpen(false)} to="/">Home</Link>
          <Link onClick={() => setOpen(false)} to="/about">About</Link>
          <Link onClick={() => setOpen(false)} to="/contact">Contact</Link>

          {token && (
            <>
              <Link onClick={() => setOpen(false)} to="/explore">Futsal Explorer</Link>
              <Link onClick={() => setOpen(false)} to="/my-bookings">My Bookings</Link>
              <button onClick={logout} className="block text-red-400">
                Logout
              </button>
            </>
          )}

          {!token && (
            <>
              <Link onClick={() => setOpen(false)} to="/login">Login</Link>
              <Link onClick={() => setOpen(false)} to="/register">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
