import { useEffect, useState } from "react";
import API from "../services/api";


function AdminCourts() {
  const [futsals, setFutsals] = useState([]);
  const [courts, setCourts] = useState([]);
  const [form, setForm] = useState({
    futsal_id: "",
    court_name: "",
    court_type: "",
    price_per_hour: "",
  });

  /* =========================
     LOAD FUTSALS
  ========================= */
  useEffect(() => {
    API.get("/futsals")
      .then((res) => setFutsals(res.data))
      .catch(() => alert("Failed to load futsals"));
  }, []);

  /* =========================
     LOAD COURTS BY FUTSAL
  ========================= */
  useEffect(() => {
    if (!form.futsal_id) return;

    API.get(`/admin/courts/${form.futsal_id}`)
      .then((res) => setCourts(res.data))
      .catch(() => alert("Failed to load courts"));
  }, [form.futsal_id]);

  const refreshCourts = () => {
    API.get(`/admin/courts/${form.futsal_id}`)
      .then((res) => setCourts(res.data));
  };

  /* =========================
     ADD COURT
  ========================= */
  const addCourt = () => {
    if (!form.futsal_id || !form.court_name || !form.price_per_hour) {
      return alert("Fill all required fields");
    }

    API.post("/admin/courts", form)
      .then((res) => {
        alert(res.data.message);
        setForm({
          ...form,
          court_name: "",
          court_type: "",
          price_per_hour: "",
        });
        refreshCourts();
      })
      .catch(() => alert("Failed to add court"));
  };

  /* =========================
     ENABLE / DISABLE COURT
  ========================= */
  const disableCourt = (court_id) => {
    API.put(`/admin/courts/${court_id}/disable`)
      .then(() => refreshCourts())
      .catch(() => alert("Failed to disable court"));
  };

  const enableCourt = (court_id) => {
    API.put(`/admin/courts/${court_id}/enable`)
      .then(() => refreshCourts())
      .catch(() => alert("Failed to enable court"));
  };

  return (
    <div className="pt-28 px-6 t-bg-base min-h-screen t-text">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Courts</h1>

        {/* Select Futsal */}
        <div className="t-card rounded-2xl p-6 mb-8">
          <label className="block text-sm mb-2 t-text-muted">
            Select Futsal
          </label>
          <select
            className="w-full bg-slate-900 border t-border p-3 rounded-xl"
            value={form.futsal_id}
            onChange={(e) =>
              setForm({ ...form, futsal_id: e.target.value })
            }
          >
            <option value="">-- Choose Futsal --</option>
            {futsals.map((f) => (
              <option key={f.futsal_id} value={f.futsal_id}>
                {f.futsal_name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Court */}
        <div className="t-card rounded-2xl p-6 mb-10">
          <h2 className="text-xl font-semibold mb-4">Add New Court</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              placeholder="Court Name"
              value={form.court_name}
              className="bg-slate-900 border t-border p-3 rounded-xl"
              onChange={(e) =>
                setForm({ ...form, court_name: e.target.value })
              }
            />

            <input
              placeholder="Court Type (5A / 7A)"
              value={form.court_type}
              className="bg-slate-900 border t-border p-3 rounded-xl"
              onChange={(e) =>
                setForm({ ...form, court_type: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Price per hour"
              value={form.price_per_hour}
              className="bg-slate-900 border t-border p-3 rounded-xl"
              onChange={(e) =>
                setForm({ ...form, price_per_hour: e.target.value })
              }
            />
          </div>

          <button
            onClick={addCourt}
            className="mt-5 bg-emerald-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-400 transition"
          >
            Add Court
          </button>
        </div>

        {/* Courts List */}
        <h2 className="text-2xl font-semibold mb-4">Courts List</h2>

        {courts.length === 0 ? (
          <div className="text-center t-text-muted t-card rounded-2xl p-10">
            No courts available for this futsal
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {courts.map((c) => (
              <div
                key={c.court_id}
                className="t-card rounded-2xl p-6 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    {c.court_name}
                  </h3>
                  <p className="t-text-muted text-sm">
                    {c.court_type || "Court"}
                  </p>
                  <p className="mt-1 text-sm">
                    Rs. {c.price_per_hour} / hour
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      c.is_active
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {c.is_active ? "Active" : "Disabled"}
                  </span>

                  <div className="mt-3">
                    {c.is_active ? (
                      <button
                        onClick={() => disableCourt(c.court_id)}
                        className="text-red-400 hover:underline"
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        onClick={() => enableCourt(c.court_id)}
                        className="text-emerald-400 hover:underline"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCourts;
