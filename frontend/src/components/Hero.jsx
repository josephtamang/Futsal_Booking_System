import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.png";
import hero3 from "../assets/hero3.jpg";

const images = [hero1, hero2, hero3];

function getRole(token) {
  try {
    return JSON.parse(atob(token.split(".")[1])).role || "user";
  } catch {
    return "user";
  }
}

function Hero() {
  const [index, setIndex] = useState(0);
  const { token } = useAuth();
  const isAdmin = token && getRole(token) === "admin";

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen pt-24 overflow-hidden">
      {/* Background Image Animation */}
      <AnimatePresence>
        <motion.img
          key={index}
          src={images[index]}
          className="absolute inset-0 w-full h-full object-cover scale-110"
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 flex items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-3xl"
        >
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-slate-100">
            Book Your <span className="text-emerald-400">Futsal</span>
            <br />
            <span className="text-slate-300 text-3xl md:text-5xl font-semibold">
              Anytime, Anywhere
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base md:text-lg text-slate-300 leading-relaxed max-w-xl">
            Find nearby futsal grounds, select courts, choose time slots, and book
            instantly — fast, smooth, and hassle-free.
          </p>

          {/* CTA Buttons */}
          {!isAdmin && (
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="px-8 py-3 rounded-full bg-emerald-500 text-slate-900 font-semibold hover:bg-emerald-400 transition shadow-lg"
              >
                Get Started
              </Link>

              <Link
                to="/about"
                className="px-8 py-3 rounded-full border border-slate-400 text-slate-100 hover:border-emerald-400 hover:text-emerald-400 transition"
              >
                Learn More
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </section>
  );
}

export default Hero;
