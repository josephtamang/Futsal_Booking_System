import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, AlertTriangle, XCircle, Timer } from "lucide-react";
import { useState } from "react";
import API from "../services/api";
import confetti from "canvas-confetti";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState({ text: "", icon: null });
  const [loading, setLoading] = useState(false);

  const fireConfetti = () => {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#14b8a6", "#22c55e"],
      });
    };



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus({ text: "Please fill in all fields", icon: AlertTriangle });
      return;
    }

    try {
      setLoading(true);
      setStatus({ text: "", icon: null });

      const res = await API.post("/contact", form);

      setStatus({ text: res.data.message, icon: null });
      setForm({ name: "", email: "", message: "" });

      fireConfetti();
    } catch (err) {
      setStatus({ text: "Failed to send message. Please try again.", icon: XCircle });
    } finally {
      setLoading(false);
    }

    
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16 px-6"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Have questions about booking futsal courts, managing slots, or using
          RinCon FutBuk? We’re here to help you.
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-6 pb-20">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900 rounded-2xl p-8 shadow-xl"
        >
          <h2 className="text-2xl font-semibold mb-6 text-emerald-400">
            Contact Information
          </h2>

          <div className="space-y-6 text-slate-300">
            <div className="flex items-start gap-4">
              <Mail className="text-emerald-400 mt-1" />
              <div>
                <p className="font-medium">Email</p>
                <p>support@rinconfutbuk.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="text-emerald-400 mt-1" />
              <div>
                <p className="font-medium">Phone</p>
                <p>+977-98XXXXXXXX</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="text-emerald-400 mt-1" />
              <div>
                <p className="font-medium">Service Area</p>
                <p>Nepal (Online Futsal Booking Platform)</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm text-slate-400">
            <p className="flex items-start gap-2">
              <Timer size={16} className="mt-0.5 shrink-0" />
              <span>Support available: <br />
              Sunday – Friday, 7 AM – 9 PM</span>
            </p>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900 rounded-2xl p-8 shadow-xl"
        >
          <h2 className="text-2xl font-semibold mb-6 text-emerald-400">
            Send Us a Message
          </h2>

          <form className="space-y-5">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your Email"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <textarea
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              placeholder="Your Message"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />

            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 font-semibold py-3 rounded-lg transition"
            >
              <Send size={18} />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          {status.text && (
            <p className="text-sm mt-4 text-center text-slate-300 inline-flex items-center gap-1.5 justify-center w-full">
              {status.icon && <status.icon size={16} />}
              {status.text}
            </p>
          )}

          <p className="text-xs text-slate-400 mt-4 text-center">
            We usually respond within 24 hours.
          </p>
        </motion.div>
      </div>
      <hr />
    </div>
  );
}

export default Contact;
