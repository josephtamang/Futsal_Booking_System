import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import image1 from "../assets/register.png";
import { Eye, EyeOff } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await API.post("/auth/register", form);
      setMessage(res.data.message || "Registration successful!");
      setSuccess(true);

      // redirect to login after short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch {
      setMessage("Registration failed. Please try again.");
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black px-4">

      {/* CARD */}
      <div className="relative w-full max-w-4xl bg-slate-800/80 backdrop-blur rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">

        <div className="grid md:grid-cols-2">

          {/* LEFT IMAGE */}
          <div
            className="hidden md:flex flex-col justify-center p-10 bg-cover bg-center"
            style={{
              backgroundImage:
                `url(${image1})`,
            }}
          >
            <div className="bg-black/60 p-6 rounded-2xl">
              <h2 className="text-3xl font-bold text-white mb-3 inline-flex items-center gap-2">
                Join RinCon FutBuk <span className="text-2xl" role="img" aria-label="football">⚽</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Create your account and start booking futsal courts anytime,
                anywhere.
              </p>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Create Account
            </h2>
            <p className="text-slate-400 mb-6 text-sm">
              Fill in your details to get started
            </p>

            <input
              name="full_name"
              placeholder="Full Name"
              className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={handleChange}
            />

            {/* PASSWORD */}
            <div className="relative mb-4">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <input
              name="phone"
              placeholder="Phone Number"
              className="w-full bg-slate-700 border border-slate-600 text-white p-3 rounded-xl mb-5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={handleChange}
            />

            <button
              onClick={handleRegister}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold p-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              Register
            </button>

            {message && (
              <p
                className={`mt-4 text-center text-sm ${
                  success ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}

            {/* FOOTER */}
            <div className="mt-6 pt-4 border-t border-slate-700 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:underline"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ANIMATION */}
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

export default Register;
