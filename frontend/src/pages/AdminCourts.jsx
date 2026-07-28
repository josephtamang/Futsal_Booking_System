import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";


function AdminCourts() {
  const [searchParams] = useSearchParams();
  const [futsals, setFutsals] = useState([]);
  const [courts, setCourts] = useState([]);
  const [form, setForm] = useState({
    futsal_id: "",
    court_name: "",
    court_type: "",
    price_per_hour: "",
  });
  const [editingCourt, setEditingCourt] = useState(null);
  const [courtEditForm, setCourtEditForm] = useState({
    court_name: "",
    court_type: "",
    price_per_hour: "",
  });

  /* =========================
     LOAD FUTSALS
  ========================= */
  useEffect(() => {
    API.get("/futsals")
      .then((res) => {
        setFutsals(res.data);
        const futsalId = searchParams.get("futsal_id");
        if (futsalId) {
          setForm((prev) => ({ ...prev, futsal_id: futsalId }));
        }
      })
      .catch(() => alert("Failed to load futsals"));
  }, [searchParams]);

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

  const startEditCourt = (court) => {
    setEditingCourt(court.court_id);
    setCourtEditForm({
      court_name: court.court_name || "",
      court_type: court.court_type || "",
      price_per_hour: court.price_per_hour || "",
    });
  };

  const cancelEditCourt = () => {
    setEditingCourt(null);
    setCourtEditForm({ court_name: "", court_type: "", price_per_hour: "" });
  };

  const saveCourt = (court_id) => {
    if (!courtEditForm.court_name || !courtEditForm.price_per_hour) {
      return alert("Court name and price are required");
    }

    API.put(`/admin/courts/${court_id}`, courtEditForm)
      .then((res) => {
        alert(res.data.message);
        cancelEditCourt();
        refreshCourts();
      })
      .catch((err) =>
        alert(err.response?.data?.message || "Failed to update court")
      );
  };

  const deleteCourt = (court_id, court_name) => {
    if (!window.confirm(`Delete ${court_name}? This will also remove its slots.`)) return;

    API.delete(`/admin/courts/${court_id}`)
      .then((res) => {
        alert(res.data.message);
        refreshCourts();
      })
      .catch((err) =>
        alert(err.response?.data?.message || "Failed to delete court")
      );
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
                className="t-card rounded-2xl p-6"
              >
                {editingCourt === c.court_id ? (
                  <div>
                    <div className="grid gap-3">
                      <input
                        value={courtEditForm.court_name}
                        onChange={(e) =>
                          setCourtEditForm({ ...courtEditForm, court_name: e.target.value })
                        }
                        className="bg-slate-900 border t-border p-3 rounded-xl"
                        placeholder="Court Name"
                      />
                      <input
                        value={courtEditForm.court_type}
                        onChange={(e) =>
                          setCourtEditForm({ ...courtEditForm, court_type: e.target.value })
                        }
                        className="bg-slate-900 border t-border p-3 rounded-xl"
                        placeholder="Court Type"
                      />
                      <input
                        type="number"
                        value={courtEditForm.price_per_hour}
                        onChange={(e) =>
                          setCourtEditForm({ ...courtEditForm, price_per_hour: e.target.value })
                        }
                        className="bg-slate-900 border t-border p-3 rounded-xl"
                        placeholder="Price per hour"
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => saveCourt(c.court_id)}
                        className="bg-emerald-500 text-slate-900 px-4 py-2 rounded-xl font-semibold hover:bg-emerald-400 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditCourt}
                        className="bg-slate-700 px-4 py-2 rounded-xl hover:bg-slate-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center gap-5">
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

                      <div className="mt-3 flex flex-col gap-2">
                        <button
                          onClick={() => startEditCourt(c)}
                          className="text-blue-300 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCourt(c.court_id, c.court_name)}
                          className="text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Court */}
        <div className="t-card rounded-2xl p-6 mt-10 mb-10">
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
      </div>
    </div>
  );
}

export default AdminCourts;
