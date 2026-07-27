import { useEffect, useState } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Convert date to YYYY-MM-DD
  const formatDateForAPI = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const formatTime = (time) => {
  if (!time || typeof time !== "string") return "-";

  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);

  if (isNaN(hour)) return "-";

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${m} ${suffix}`;
};


const fetchBookings = () => {
  const formattedDate = selectedDate
    ? formatDateForAPI(selectedDate)
    : "";

  console.log("FILTER DATE:", formattedDate);

  API.get("/admin/bookings", {
    params: {
      date: formattedDate,
      status: selectedStatus !== "all" ? selectedStatus : "",
    },
  })
    .then((res) => setBookings(res.data))
    .catch(() => alert("Failed to load bookings"));
};

useEffect(() => {
  const today = new Date().toISOString().split("T")[0];
  setSelectedDate(today);
}, []);


  useEffect(() => {
    fetchBookings();
  }, [selectedDate, selectedStatus]);

  const cancelBooking = (id) => {
    API.put(`/admin/cancel-booking/${id}`)
      .then(() => fetchBookings())
      .catch(() => alert("Failed to cancel booking"));
  };

  return (
    <div className="pt-28 px-6 t-bg-base min-h-screen t-text">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="t-input p-2 rounded"
        />

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="t-input p-2 rounded"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border t-border rounded-lg">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Futsal</th>
              <th className="p-3">Court</th>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-6 t-text-muted">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.booking_id} className="border-t t-border">
                  <td className="p-3 text-center">{b.full_name}</td>
                  <td className="p-3 text-center">{b.futsal_name}</td>
                  <td className="p-3 text-center">{b.court_name}</td>
                  <td className="p-3 text-center">
                    {new Date(b.booking_date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-3 text-center">
                    {formatTime(b.start_time)} – {formatTime(b.end_time)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        b.status === "confirmed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => cancelBooking(b.booking_id)}
                        className="text-red-400 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
