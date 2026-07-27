import { useState } from "react";
import API from "../services/api";
import {
  MapPin,
  Ruler,
  Calendar,
  Star,
  Clock,
  Satellite,
  CheckCircle2,
  Bot,
  Flame,
  XCircle,
  Building2,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (t) => {
  if (!t) return null;
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

// ─── FutsalCard ───────────────────────────────────────────────────────────────
function FutsalCard({ futsal, rank, strategy }) {
  return (
    <div className="t-card rounded-2xl p-5 flex flex-col gap-3 hover:border-emerald-500/50 transition-all">
      {/* rank + name row */}
      <div className="flex items-start gap-3">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            rank === 1
              ? "bg-amber-500/20 text-amber-400"
              : rank === 2
              ? "bg-slate-400/20 t-text"
              : rank === 3
              ? "bg-orange-700/20 text-orange-400"
              : "bg-slate-700 t-text-muted"
          }`}
        >
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-tight truncate">
            {futsal.futsal_name}
          </h3>
          <p className="t-text-muted text-sm truncate mt-0.5 inline-flex items-center gap-1">
            <MapPin size={14} className="shrink-0" />{futsal.address || "No address"}
          </p>
        </div>
      </div>

      {/* badges row */}
      <div className="flex flex-wrap gap-2 text-xs">
        {strategy === "nearest" && futsal.distance_km !== undefined && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold inline-flex items-center gap-1">
            <Ruler size={12} />{futsal.distance_km} km away
          </span>
        )}
        {strategy === "popular" && (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 font-semibold inline-flex items-center gap-1">
            <Calendar size={12} />{futsal.total_bookings} bookings
          </span>
        )}
        {futsal.visited_before && (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 font-semibold inline-flex items-center gap-1">
            <Star size={12} />You've been here
          </span>
        )}
        {futsal.opening_time && (
          <span className="px-2.5 py-1 rounded-full bg-slate-700 t-text inline-flex items-center gap-1">
            <Clock size={12} />{fmtTime(futsal.opening_time)} – {fmtTime(futsal.closing_time)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────
function Recommendations() {
  const [activeTab, setActiveTab]         = useState("nearest");
  const [results, setResults]             = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [locationStatus, setLocStatus]    = useState({ text: "", icon: null });
  const [hasSearched, setHasSearched]     = useState(false);
  const [strategy, setStrategy]           = useState("");

  // ── Nearest: get GPS then call API ────────────────────────────────────────
  const findNearest = () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support geolocation.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setHasSearched(false);
    setLocStatus({ text: "Getting your location…", icon: Satellite });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocStatus({ text: `Location found (${lat.toFixed(4)}, ${lng.toFixed(4)})`, icon: CheckCircle2 });

        try {
          const res = await API.post("/recommend/nearest", { lat, lng, top_n: 5 });
          setResults(res.data.recommendations || []);
          setStrategy("nearest");
          setHasSearched(true);
        } catch (err) {
          setError(
            err.response?.data?.message ||
            "Could not reach the AI service. Make sure ai-model/app.py is running on port 5001."
          );
        } finally {
          setLoading(false);
        }
      },
      (geoErr) => {
        setLoading(false);
        setLocStatus({ text: "", icon: null });
        if (geoErr.code === 1) {
          setError("Location access denied. Please allow location in your browser and try again.");
        } else {
          setError("Could not get your location. Try again.");
        }
      },
      { timeout: 10000 }
    );
  };

  // ── Popular: straight API call ─────────────────────────────────────────────
  const findPopular = async () => {
    setLoading(true);
    setError("");
    setResults([]);
    setHasSearched(false);
    setLocStatus({ text: "", icon: null });

    try {
      const res = await API.post("/recommend/popular", { top_n: 5 });
      setResults(res.data.recommendations || []);
      setStrategy("popular");
      setHasSearched(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not reach the AI service. Make sure ai-model/app.py is running on port 5001."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === "nearest") findNearest();
    else findPopular();
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setResults([]);
    setError("");
    setLocStatus({ text: "", icon: null });
    setHasSearched(false);
  };

  return (
    <div className="pt-28 px-6 md:px-12 lg:px-20 t-bg-base min-h-screen t-text pb-16">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bot size={32} />
            <h1 className="text-3xl font-bold">AI Recommendations</h1>
          </div>
          <p className="t-text-muted">
            Powered by scikit-learn — find the best futsal for you.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => switchTab("nearest")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "nearest"
                ? "bg-emerald-500 text-slate-900"
                : "bg-slate-800 t-text-muted hover:text-slate-100 border t-border"
            }`}
          >
            <span className="inline-flex items-center gap-1.5 justify-center"><MapPin size={16} />Nearest Futsal</span>
          </button>
          <button
            onClick={() => switchTab("popular")}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "popular"
                ? "bg-emerald-500 text-slate-900"
                : "bg-slate-800 t-text-muted hover:text-slate-100 border t-border"
            }`}
          >
            <span className="inline-flex items-center gap-1.5 justify-center"><Flame size={16} />Popular Futsals</span>
          </button>
        </div>

        {/* Info card */}
        <div className="t-card rounded-2xl p-5 mb-6">
          {activeTab === "nearest" ? (
            <div className="flex gap-4 items-start">
              <MapPin size={24} className="shrink-0" />
              <div>
                <h2 className="font-semibold mb-1">Nearest Futsal Finder</h2>
                <p className="t-text-muted text-sm leading-relaxed">
                  Uses your device's GPS and the{" "}
                  <span className="text-emerald-400 font-medium">scikit-learn NearestNeighbors</span>{" "}
                  algorithm with Haversine distance to find the closest futsals to you.
                  Click the button and allow location access.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 items-start">
              <Flame size={24} className="shrink-0" />
              <div>
                <h2 className="font-semibold mb-1">Popularity-Based Recommendations</h2>
                <p className="t-text-muted text-sm leading-relaxed">
                  Uses{" "}
                  <span className="text-emerald-400 font-medium">numpy scoring</span>{" "}
                  on booking history to rank futsals. Futsals you've visited before get an
                  extra boost — making this a personalised recommendation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 font-bold rounded-2xl text-base transition-all hover:scale-[1.01] mb-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
              {activeTab === "nearest" ? "Locating you…" : "Analysing bookings…"}
            </span>
          ) : activeTab === "nearest" ? (
            <span className="inline-flex items-center gap-2 justify-center"><MapPin size={18} />Find Nearest Futsals</span>
          ) : (
            <span className="inline-flex items-center gap-2 justify-center"><Flame size={18} />Get Popular Futsals</span>
          )}
        </button>

        {/* Location status */}
        {locationStatus.text && (
          <p className="text-sm t-text-muted mb-4 text-center inline-flex items-center gap-1.5 justify-center w-full">
            {locationStatus.icon && <locationStatus.icon size={14} />}
            {locationStatus.text}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
            <p className="text-red-400 text-sm inline-flex items-center gap-1.5"><XCircle size={14} />{error}</p>
            {error.includes("app.py") && (
              <div className="mt-3 t-card rounded-xl p-3 text-xs font-mono t-text">
                <p className="t-text-muted mb-1">Run in a new terminal:</p>
                <p>cd ai-model</p>
                <p>pip install -r requirements.txt</p>
                <p>python app.py</p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {hasSearched && results.length === 0 && !error && (
          <div className="text-center t-text-muted t-card rounded-2xl p-10">
            <Building2 size={28} className="mx-auto mb-2" />
            <p>
              {activeTab === "nearest"
                ? "No futsals with location data found. Ask admin to add latitude/longitude."
                : "No booking data found yet."}
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg inline-flex items-center gap-2">
                {activeTab === "nearest" ? (
                  <><MapPin size={18} />{results.length} Nearest Futsals</>
                ) : (
                  <><Flame size={18} />Top {results.length} Popular Futsals</>
                )}
              </h2>
              <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border t-border">
                AI-powered
              </span>
            </div>

            {results.map((futsal, i) => (
              <FutsalCard
                key={futsal.futsal_id}
                futsal={futsal}
                rank={i + 1}
                strategy={strategy}
              />
            ))}

            <p className="text-center text-xs text-slate-600 pt-2">
              Recommendations generated using scikit-learn NearestNeighbors &amp; numpy scoring
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
