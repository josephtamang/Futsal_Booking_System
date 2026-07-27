import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import {
  CircleDot,
  Lightbulb,
  ShowerHead,
  SquareParking,
  Droplet,
  Shirt,
  Coffee,
  Wifi,
  Mountain,
  Waves,
  Store,
  Star,
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  LayoutGrid,
  PartyPopper,
  XCircle,
} from "lucide-react";

const AMENITY_ICONS = {
  "Synthetic Turf": CircleDot,
  "FIFA Turf": CircleDot,
  "Premium Turf": CircleDot,
  "Full-Size Court": CircleDot,
  "Quality Turf": CircleDot,
  "LED Floodlights": Lightbulb,
  "Flood Lights": Lightbulb,
  "Night Lights": Lightbulb,
  "Bright Lighting": Lightbulb,
  "LED Lighting": Lightbulb,
  "Changing Rooms": ShowerHead,
  "Shower & Locker": ShowerHead,
  "Clean Facilities": ShowerHead,
  "Changing Area": ShowerHead,
  "Clean Changing Rooms": ShowerHead,
  "Facilities": ShowerHead,
  "Parking": SquareParking,
  "Street Parking": SquareParking,
  "Parking Area": SquareParking,
  "Large Parking": SquareParking,
  "Drinking Water": Droplet,
  "Water Station": Droplet,
  "Bib Rental": Shirt,
  "Equipment Hire": Shirt,
  "Gear Available": Shirt,
  "Café Nearby": Coffee,
  "Refreshments": Coffee,
  "Free WiFi": Wifi,
  "Mountain Views": Mountain,
  "Lakeside Location": Waves,
  "Canteen": Store,
};

function AmenityIcon({ label }) {
  const Icon = AMENITY_ICONS[label] || CircleDot;
  return <Icon size={16} className="shrink-0" style={{ color: "var(--accent)" }} />;
}

// ── Nepal-appropriate futsal descriptions & details ──────────────────────────
const FUTSAL_DETAILS = {
  default: {
    tagline: "Premium futsal experience in the heart of Nepal",
    description:
      "A state-of-the-art futsal facility equipped with high-quality synthetic turf, bright LED floodlights, and modern changing rooms. Designed for both casual players and competitive teams, this venue offers a clean, safe, and exciting environment to enjoy the beautiful game.",
    amenities: ["Synthetic Turf", "LED Floodlights", "Changing Rooms", "Parking", "Drinking Water", "Bib Rental"],
    images: [
      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1200&q=80",
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=1200&q=80",
      "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=1200&q=80",
    ],
    location_hint: "Kathmandu, Nepal",
    rating: 4.5,
  },
};

const FUTSAL_PRESETS = [
  {
    keywords: ["kathmandu", "ktm", "thamel", "newroad", "new road"],
    tagline: "Kathmandu's favourite futsal arena",
    description:
      "Nestled in the vibrant capital city, this futsal arena is the go-to spot for players across Kathmandu Valley. Featuring FIFA-approved synthetic turf, bright LED lighting for evening matches, and easy access from Thamel and New Road, it's perfect for office tournaments, friend groups, and serious training sessions alike.",
    amenities: ["FIFA Turf", "Flood Lights", "Shower & Locker", "Street Parking", "Café Nearby", "Free WiFi"],
    images: [
      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1200&q=80",
      "https://images.unsplash.com/photo-1551958219-acbc595d5b87?w=1200&q=80",
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=1200&q=80",
    ],
    location_hint: "Kathmandu Metropolitan City",
    rating: 4.7,
  },
  {
    keywords: ["lalitpur", "patan", "sanepa", "jawalakhel"],
    tagline: "Lalitpur's premium turf experience",
    description:
      "Located in the cultural heart of Lalitpur, this facility blends modern sports infrastructure with the historic charm of Patan. The well-maintained synthetic pitch, dedicated warm-up zones, and clean facilities make it a top choice for players from Sanepa, Jawalakhel, and surrounding areas.",
    amenities: ["Premium Turf", "Night Lights", "Clean Facilities", "Parking Area", "Water Station", "Equipment Hire"],
    images: [
      "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=1200&q=80",
      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1200&q=80",
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=1200&q=80",
    ],
    location_hint: "Lalitpur Sub-Metropolitan City",
    rating: 4.6,
  },
  {
    keywords: ["bhaktapur", "suryabinayak", "sallaghari"],
    tagline: "Where heritage meets sport",
    description:
      "Set near the ancient city of Bhaktapur, this futsal venue offers a unique experience — quality sport amid rich Newari culture. The full-sized synthetic court is ideal for competitive play, while the surrounding mountain views make every session memorable.",
    amenities: ["Full-Size Court", "Bright Lighting", "Changing Area", "Large Parking", "Mountain Views", "Bib Rental"],
    images: [
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=1200&q=80",
      "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=1200&q=80",
      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1200&q=80",
    ],
    location_hint: "Bhaktapur Municipality",
    rating: 4.4,
  },
  {
    keywords: ["pokhara", "lakeside", "fewa"],
    tagline: "Play beside the lake, under the Himalayas",
    description:
      "Pokhara's premier futsal destination offering a breathtaking experience — play your favourite sport with the Annapurna range as your backdrop. The lakeside facility boasts high-quality turf, modern changing rooms, and a relaxed atmosphere that captures Pokhara's unique vibe.",
    amenities: ["Quality Turf", "Mountain Views", "Clean Changing Rooms", "Parking", "Lakeside Location", "Refreshments"],
    images: [
      "https://images.unsplash.com/photo-1551958219-acbc595d5b87?w=1200&q=80",
      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1200&q=80",
      "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=1200&q=80",
    ],
    location_hint: "Pokhara Metropolitan City",
    rating: 4.8,
  },
  {
    keywords: ["biratnagar", "morang", "eastern"],
    tagline: "Eastern Nepal's top futsal arena",
    description:
      "Biratnagar's premier indoor-outdoor futsal facility brings world-class standards to eastern Nepal. With easy highway access, ample parking, and top-quality synthetic turf, this venue is the gathering point for futsal enthusiasts across Morang and Sunsari districts.",
    amenities: ["Synthetic Turf", "LED Lighting", "Facilities", "Large Parking", "Canteen", "Gear Available"],
    images: [
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=1200&q=80",
      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1200&q=80",
      "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=1200&q=80",
    ],
    location_hint: "Biratnagar Metropolitan City",
    rating: 4.3,
  },
];

function getFutsalDetail(futsal) {
  const nameLower = (futsal.futsal_name + " " + (futsal.address || "")).toLowerCase();
  for (const preset of FUTSAL_PRESETS) {
    if (preset.keywords.some((kw) => nameLower.includes(kw))) return preset;
  }
  return FUTSAL_DETAILS.default;
}

// ── Star rating ───────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= Math.round(rating) ? "text-amber-400" : "text-slate-600"}
          fill="currentColor"
        />
      ))}
      <span className="text-sm ml-1" style={{ color: "var(--text-secondary)" }}>{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Format helpers ────────────────────────────────────────────────────────────
function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

// ── Main page ─────────────────────────────────────────────────────────────────
function FutsalDetail() {
  const { futsal_id } = useParams();
  const navigate = useNavigate();

  const [futsal, setFutsal]           = useState(null);
  const [courts, setCourts]           = useState([]);
  const [slots, setSlots]             = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedCourt, setSelCourt]  = useState(null);
  const [selectedDate, setSelDate]    = useState(new Date().toISOString().split("T")[0]);
  const [heroImg, setHeroImg]         = useState(0);
  const [booking, setBooking]         = useState(false);
  const [bookMsg, setBookMsg]         = useState({ text: "", ok: true });
  const [detail, setDetail]           = useState(null);

  // load futsal + courts
  useEffect(() => {
    API.get("/futsals")
      .then((res) => {
        const found = res.data.find((f) => String(f.futsal_id) === String(futsal_id));
        if (!found) { navigate("/explore"); return; }
        setFutsal(found);
        setDetail(getFutsalDetail(found));
      })
      .catch(() => navigate("/explore"));

    API.get(`/courts/${futsal_id}`)
      .then((res) => setCourts(res.data))
      .catch(() => {});
  }, [futsal_id]);

  // load slots when court changes
  useEffect(() => {
    if (!selectedCourt) return;
    Promise.all([
      API.get(`/slots/${selectedCourt.court_id}`),
      API.get(`/slots/booked-slots/${selectedCourt.court_id}/${selectedDate}`),
    ]).then(([sRes, bRes]) => {
      setSlots(sRes.data);
      setBookedSlots(bRes.data);
    });
  }, [selectedCourt]);

  // reload booked on date change
  useEffect(() => {
    if (!selectedCourt) return;
    API.get(`/slots/booked-slots/${selectedCourt.court_id}/${selectedDate}`)
      .then((res) => setBookedSlots(res.data));
  }, [selectedDate]);

  const bookSlot = async (slot) => {
    setBooking(true);
    try {
      const res = await API.post("/bookings", {
        court_id: slot.court_id,
        slot_id: slot.slot_id,
        booking_date: selectedDate,
      });
      setBookMsg({ text: res.data.message, ok: true });
      // refresh booked slots
      const bRes = await API.get(`/slots/booked-slots/${selectedCourt.court_id}/${selectedDate}`);
      setBookedSlots(bRes.data);
    } catch (err) {
      setBookMsg({ text: err.response?.data?.message || "Booking failed", ok: false });
    } finally {
      setBooking(false);
      setTimeout(() => setBookMsg({ text: "", ok: true }), 3500);
    }
  };

  if (!futsal || !detail) {
    return (
      <div className="pt-28 min-h-screen t-bg-base flex items-center justify-center">
        <div className="skeleton w-64 h-6" />
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="t-bg-base min-h-screen t-text">

      {/* ── HERO IMAGE SECTION ─────────────────────────────────────── */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          key={heroImg}
          src={detail.images[heroImg]}
          alt={futsal.futsal_name}
          className="w-full h-full object-cover animate-fadeUp"
          style={{ animationDuration: "0.6s" }}
        />
        <div className="futsal-hero-overlay absolute inset-0" />

        {/* Back button */}
        <button
          onClick={() => navigate("/explore")}
          className="absolute top-20 left-6 flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium text-sm backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <ArrowLeft size={16} /> Back to Explorer
        </button>

        {/* Image dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {detail.images.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroImg(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: heroImg === i ? "var(--accent)" : "rgba(255,255,255,0.5)",
                transform: heroImg === i ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>

        {/* Futsal name on hero */}
        <div className="absolute bottom-10 left-6 right-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
            {futsal.futsal_name}
          </h1>
          <p className="text-slate-300 text-sm mt-1">{detail.location_hint}</p>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_380px] gap-10">

        {/* LEFT COLUMN */}
        <div className="space-y-8 animate-fadeUp">

          {/* Rating + tagline */}
          <div>
            <Stars rating={detail.rating} />
            <p className="text-lg font-semibold mt-2" style={{ color: "var(--accent)" }}>
              {detail.tagline}
            </p>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold mb-3">About this Futsal</h2>
            <p className="leading-relaxed text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
              {detail.description}
            </p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-bold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {detail.amenities.map((a, i) => (
                <div key={i} className="t-card px-4 py-3 text-sm font-medium flex items-center gap-2">
                  <AmenityIcon label={a} />
                  {a}
                </div>
              ))}
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-2 gap-4">
            {futsal.address && (
              <div className="t-card p-4">
                <p className="text-xs mb-1 inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}><MapPin size={12} />Address</p>
                <p className="text-sm font-medium">{futsal.address}</p>
              </div>
            )}
            {futsal.opening_time && (
              <div className="t-card p-4">
                <p className="text-xs mb-1 inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}><Clock size={12} />Hours</p>
                <p className="text-sm font-medium">
                  {fmtTime(futsal.opening_time)} – {fmtTime(futsal.closing_time)}
                </p>
              </div>
            )}
          </div>

          {/* Photo gallery thumbnails */}
          <div>
            <h2 className="text-xl font-bold mb-4">Gallery</h2>
            <div className="grid grid-cols-3 gap-3">
              {detail.images.map((img, i) => (
                <button key={i} onClick={() => setHeroImg(i)} className="overflow-hidden rounded-xl aspect-video">
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    style={{ outline: heroImg === i ? `2px solid var(--accent)` : "none" }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Booking Panel */}
        <div className="animate-fadeUp" style={{ animationDelay: "0.1s" }}>
          <div className="t-card p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-5">Book a Court</h2>

            {/* Date picker */}
            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                <Calendar size={14} />Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={today}
                onChange={(e) => setSelDate(e.target.value)}
                className="t-input text-sm"
              />
            </div>

            {/* Courts */}
            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                <LayoutGrid size={14} />Select Court
              </label>
              {courts.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No courts available</p>
              ) : (
                <div className="space-y-2">
                  {courts.map((c) => (
                    <div
                      key={c.court_id}
                      onClick={() => setSelCourt(c)}
                      className={`court-card ${selectedCourt?.court_id === c.court_id ? "active" : ""}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm">{c.court_name}</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                            {c.court_type || "Standard"} Court
                          </p>
                        </div>
                        <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                          Rs. {c.price_per_hour}<span className="text-xs font-normal">/hr</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slots */}
            {selectedCourt && (
              <div className="mb-5">
                <label className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                  <Clock size={14} />Available Slots
                </label>
                {slots.length === 0 ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>No slots configured</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map((s) => {
                      const isBooked = bookedSlots.includes(s.slot_id);
                      return (
                        <button
                          key={s.slot_id}
                          disabled={isBooked || booking}
                          onClick={() => !isBooked && bookSlot(s)}
                          className={`slot-btn ${isBooked ? "booked" : ""}`}
                        >
                          {fmtTime(s.start_time)}<br />
                          <span style={{ color: isBooked ? "inherit" : "var(--text-secondary)" }}>
                            – {fmtTime(s.end_time)}
                          </span>
                          {isBooked && <span className="block text-xs mt-0.5">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!selectedCourt && (
              <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                Select a court above to see available slots
              </p>
            )}

            {/* Booking message */}
            {bookMsg.text && (
              <div
                className="mt-3 px-4 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-1.5"
                style={{
                  background: bookMsg.ok ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                  color: bookMsg.ok ? "var(--accent)" : "var(--danger)",
                }}
              >
                {bookMsg.ok ? <PartyPopper size={16} /> : <XCircle size={16} />}
                {bookMsg.text}
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 flex gap-4 text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ border: "1.5px solid var(--border)", background: "var(--bg-elevated)" }} />
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded opacity-40" style={{ background: "var(--bg-elevated)" }} />
                Booked
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FutsalDetail;
