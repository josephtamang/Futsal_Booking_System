import { useEffect, useState } from "react";
import API from "../services/api";

function AdminSlots() {
  const [futsals, setFutsals] = useState([]);
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedFutsal, setSelectedFutsal] = useState("");
  const [selectedCourt, setSelectedCourt] = useState("");

  const [newSlot, setNewSlot] = useState({
    start_time: "",
    end_time: "",
  });

  /* ---------------- LOAD FUTSALS ---------------- */
  useEffect(() => {
    API.get("/futsals")
      .then((res) => setFutsals(res.data))
      .catch(() => alert("Failed to load futsals"));
  }, []);

  /* ---------------- LOAD COURTS ---------------- */
  useEffect(() => {
    if (!selectedFutsal) return;

    API.get(`/courts/${selectedFutsal}`)
      .then((res) => {
        setCourts(res.data);
        setSelectedCourt("");
        setSlots([]);
      })
      .catch(() => alert("Failed to load courts"));
  }, [selectedFutsal]);

  /* ---------------- LOAD SLOTS ---------------- */
  useEffect(() => {
    if (!selectedCourt) return;

    API.get(`/admin/slots/court/${selectedCourt}`)
      .then((res) => setSlots(res.data))
      .catch(() => alert("Failed to load slots"));
  }, [selectedCourt]);

  /* ---------------- ADD SLOT ---------------- */
  const addSlot = () => {
    if (!newSlot.start_time || !newSlot.end_time) {
      return alert("Please select start and end time");
    }

    API.post("/admin/slots", {
      court_id: selectedCourt,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
    })
      .then(() => {
        setNewSlot({ start_time: "", end_time: "" });
        return API.get(`/admin/slots/court/${selectedCourt}`);
      })
      .then((res) => setSlots(res.data))
      .catch(() => alert("Failed to add slot"));
  };

  /* ---------------- ENABLE / DISABLE ---------------- */
  const toggleSlot = (id, isActive) => {
    const endpoint = isActive ? "disable" : "enable";

    API.put(`/admin/slots/${id}/${endpoint}`)
      .then(() => {
        setSlots((prev) =>
          prev.map((s) =>
            s.slot_id === id
              ? { ...s, is_active: isActive ? 0 : 1 }
              : s
          )
        );
      })
      .catch(() => alert("Action failed"));
  };

  return (
    <div className="pt-28 px-6 t-bg-base min-h-screen t-text">
      <h1 className="text-3xl font-bold mb-8">Manage Time Slots</h1>

      {/* SELECTION */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <select
          className="t-input p-3 rounded-xl"
          value={selectedFutsal}
          onChange={(e) => setSelectedFutsal(e.target.value)}
        >
          <option value="">Select Futsal</option>
          {futsals.map((f) => (
            <option key={f.futsal_id} value={f.futsal_id}>
              {f.futsal_name}
            </option>
          ))}
        </select>

        <select
          className="t-input p-3 rounded-xl"
          value={selectedCourt}
          onChange={(e) => setSelectedCourt(e.target.value)}
          disabled={!courts.length}
        >
          <option value="">Select Court</option>
          {courts.map((c) => (
            <option key={c.court_id} value={c.court_id}>
              {c.court_name}
            </option>
          ))}
        </select>
      </div>

      {/* ADD SLOT */}
      {selectedCourt && (
        <div className="t-card rounded-2xl p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4">
            Add Slot to Selected Court
          </h2>

          <div className="flex flex-wrap gap-4">
            <input
              type="time"
              value={newSlot.start_time}
              onChange={(e) =>
                setNewSlot({ ...newSlot, start_time: e.target.value })
              }
              className="t-input p-3 rounded-lg"
            />

            <input
              type="time"
              value={newSlot.end_time}
              onChange={(e) =>
                setNewSlot({ ...newSlot, end_time: e.target.value })
              }
              className="t-input p-3 rounded-lg"
            />

            <button
              onClick={addSlot}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-lg"
            >
              Add Slot
            </button>
          </div>
        </div>
      )}

      {/* SLOT LIST */}
      {slots.length > 0 && (
        <div className="t-card rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="p-4 text-left">Time</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.slot_id} className="border-t t-border">
                  <td className="p-4">
                    {s.start_time} – {s.end_time}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        s.is_active
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {s.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        toggleSlot(s.slot_id, s.is_active)
                      }
                      className="hover:underline"
                    >
                      {s.is_active ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminSlots;
