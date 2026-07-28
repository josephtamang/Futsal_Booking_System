import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import image1 from "../assets/login.jpg";
import { Eye, EyeOff } from "lucide-react";


function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.token);
      navigate(res.data.user?.role === "admin" ? "/admin/futsals" : "/explore");
    } catch {
      setMessage("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black px-4">
      
      {/* CARD */}
      <div className="relative w-full max-w-4xl bg-slate-800/80 backdrop-blur rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">

        <div className="grid md:grid-cols-2">

          {/* LEFT IMAGE / BRAND */}
          <div
            className="hidden md:flex flex-col justify-center p-10 bg-cover bg-center bg-linear-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40"
            style={{
              backgroundImage:
                `url(${image1})`,
            }}
          >
            <div className="bg-black/60 p-6 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-3 inline-flex items-center gap-2">
                <span className="text-2xl" role="img" aria-label="football">⚽</span> RinCon FutBuk
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Book futsal courts easily, choose your time, and play without
                hassle. Fast, simple, and built for players.
              </p>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-400 mb-6 text-sm">
              Login to continue booking futsals
            </p>

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* PASSWORD */}
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button
              onClick={handleLogin}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold p-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              Login
            </button>

            {message && (
              <p className="mt-4 text-center text-red-400 text-sm">
                {message}
              </p>
            )}

            {/* FOOTER */}
            <div className="mt-6 pt-4 border-t border-slate-700 text-center">
              <p className="text-slate-400 text-sm">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="text-emerald-400 hover:underline"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SIMPLE ANIMATION */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-in-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

export default Login;
