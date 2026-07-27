import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

function Footer() {
  return (
    <footer className="t-bg-base t-text relative overflow-hidden">
      
      {/* Glow Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Footer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12"
      >
        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 inline-flex items-center gap-1.5">
            <span className="text-xl" role="img" aria-label="football">⚽</span> RinCon FutBuk
          </h2>
          <p className="text-sm leading-relaxed">
            A smart online futsal booking platform that helps players easily
            find, book, and manage futsal courts across Nepal.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-emerald-400">Home</Link></li>
            <li><Link to="/about" className="hover:text-emerald-400">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-400">Contact</Link></li>
            <li><Link to="/explore" className="hover:text-emerald-400">Book Futsal</Link></li>
          </ul>
        </div>

        {/* User */}
        <div>
          <h3 className="text-white font-semibold mb-4">User</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-emerald-400">Login</Link></li>
            <li><Link to="/register" className="hover:text-emerald-400">Register</Link></li>
            <li><Link to="/my-bookings" className="hover:text-emerald-400">My Bookings</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-emerald-400" />
              support@rinconfutbuk.com
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-emerald-400" />
              +977-98XXXXXXXX
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-400" />
              Nepal
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="border-t t-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm t-text-muted">
          <p>
            © {new Date().getFullYear()} RinCon FutBuk. All rights reserved.
          </p>

          <div className="flex gap-4">
            <Link to="#" className="hover:text-emerald-400">Privacy Policy</Link>
            <Link to="#" className="hover:text-emerald-400">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
