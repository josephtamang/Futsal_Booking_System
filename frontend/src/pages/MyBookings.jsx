import { useEffect, useState } from "react";
import API from "../services/api";
import { CheckCircle2, XCircle } from "lucide-react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const loadBookings = () => {
    API.get("/bookings/my-bookings")
      .then((res) => setBookings(res.data))
      .catch(() => alert("Failed to load bookings"));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    API.put(`/bookings/cancel/${id}`)
      .then((res) => {
        alert(res.data.message);
        loadBookings(); // refresh list
      })
      .catch(() => alert("Cancel failed"));
  };

  // Format date: 2026-01-27 → 27 Jan 2026
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format time: 18:00:00 → 6:00 PM
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const StatusBadge = ({ status }) => {
    const base =
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold";

    if (status === "confirmed") {
      return (
        <span className={`${base} bg-emerald-500/15 text-emerald-400`}>
          <CheckCircle2 size={14} /> Confirmed
        </span>
      );
    }

    return (
      <span className={`${base} bg-red-500/15 text-red-400`}><XCircle size={14} /> Cancelled</span>
    );
  };

  return (
    <div className="pt-28 px-6 md:px-12 lg:px-20 t-bg-base min-h-screen t-text pb-15">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <p className="t-text-muted">You have no bookings yet.</p>
        ) : (
          <div className="space-y-4 ">
            {bookings.map((b) => (
              <div
                key={b.booking_id}
                className="t-card p-6 rounded-2xl border t-border"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-lg">{b.futsal_name}</h2>
                    <p className="t-text-muted">Court: {b.court_name}</p>
                    <p className="t-text-muted">
                      Date: {formatDate(b.booking_date)}
                    </p>
                    <p className="t-text-muted">
                      Time: {formatTime(b.start_time)} –{" "}
                      {formatTime(b.end_time)}
                    </p>

                    <div >
                      <div className="mt-2">
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  </div>

                  {b.status === "confirmed" && (
                    <button
                      onClick={() => cancelBooking(b.booking_id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
