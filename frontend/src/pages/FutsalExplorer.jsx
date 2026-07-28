import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import { Search, Building2, MapPin, Clock, ArrowRight } from "lucide-react";

const THUMB_IDS = [
  "1575361204480-aadea25e6e68",
  "1552667466-07770ae110d0",
  "1556056504-5c7696c4c28d",
  "1551958219-acbc595d5b87",
  "1518604666-535e3b67b2df",
  "1543326727-cf6c39e8f84c",
];

const API_ORIGIN = "http://localhost:5000";

function timeToMinutes(time) {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
}

function getCurrentMinutes() {
  const date = new Date();
  return date.getHours() * 60 + date.getMinutes();
}

function isOpenNow(futsal) {
  if (!futsal.opening_time || !futsal.closing_time) return false;

  const current = getCurrentMinutes();
  return (
    current >= timeToMinutes(futsal.opening_time) &&
    current < timeToMinutes(futsal.closing_time)
  );
}

function FutsalExplorer() {
  const [futsals, setFutsals] = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/futsals")
      .then((res) => setFutsals(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = futsals.filter((f) =>
    f.futsal_name.toLowerCase().includes(search.toLowerCase()) ||
    (f.address || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="t-bg-base min-h-screen t-text pt-28 pb-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-extrabold">Explore Futsals</h1>
          <p className="mt-2 text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
            Select a futsal to view details, courts, and book your slot.
          </p>
        </motion.div>

        {/* How it works */}
        <div className="t-card p-5 mb-8">
          <div className="flex flex-wrap gap-6 text-sm">
            {["Pick a futsal", "View full details", "Choose date & court", "Confirm booking"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span style={{ color: "var(--text-secondary)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8 relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or location…"
            className="t-input w-full pl-9"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="t-card p-12 text-center">
            <Building2 size={36} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-secondary)" }}>No futsals found.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((f, i) => {
              const openNow = isOpenNow(f);

              return (
              <motion.div
                key={f.futsal_id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => navigate(`/futsal/${f.futsal_id}`)}
                className="t-card cursor-pointer group overflow-hidden"
                style={{ padding: 0 }}
              >
                {/* Thumbnail */}
                <div className="relative h-40 overflow-hidden rounded-t-2xl">
                  <img
                    src={
                      f.image_url
                        ? `${API_ORIGIN}${f.image_url}`
                        : `https://images.unsplash.com/photo-${THUMB_IDS[i % THUMB_IDS.length]}?w=600&q=70`
                    }
                    alt={f.futsal_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <span
                    className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-semibold"
                    style={{
                      background: openNow
                        ? "rgba(16, 185, 129, 0.9)"
                        : "rgba(244, 63, 94, 0.9)",
                      color: "#fff",
                    }}
                  >
                    {openNow ? "Active" : "Inactive"}
                  </span>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-bold text-white text-base leading-tight truncate">{f.futsal_name}</h3>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  {f.address && (
                    <p className="text-xs mb-2 flex items-start gap-1.5" style={{ color: "var(--text-secondary)" }}>
                      <MapPin size={14} className="shrink-0" /><span className="truncate">{f.address}</span>
                    </p>
                  )}
                  {f.opening_time && (
                    <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                      <Clock size={12} />{f.opening_time} – {f.closing_time}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1"
                      style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                    >
                      View & Book <ArrowRight size={12} />
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Nepal</span>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default FutsalExplorer;
