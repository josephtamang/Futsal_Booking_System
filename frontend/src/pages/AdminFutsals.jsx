import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  ArrowRight,
  Building2,
  Clock,
  ImagePlus,
  MapPin,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

const API_ORIGIN = "http://localhost:5000";
const FALLBACK_IMAGES = [
  "1575361204480-aadea25e6e68",
  "1552667466-07770ae110d0",
  "1556056504-5c7696c4c28d",
];

function AdminFutsals() {
  const [futsals, setFutsals] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    futsal_name: "",
    address: "",
    opening_time: "",
    closing_time: "",
  });
  const [imageFiles, setImageFiles] = useState({});
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newFutsal, setNewFutsal] = useState({
    futsal_name: "",
    address: "",
    latitude: "",
    longitude: "",
    opening_time: "07:00",
    closing_time: "20:00",
  });
  const [newImage, setNewImage] = useState(null);
  const navigate = useNavigate();

  const loadFutsals = () => {
    setLoading(true);
    API.get("/admin-settings/futsals")
      .then((res) => setFutsals(res.data))
      .catch(() => alert("Failed to load futsals"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFutsals();
  }, []);

  const startEdit = (futsal) => {
    setEditing(futsal.futsal_id);
    setForm({
      futsal_name: futsal.futsal_name || "",
      address: futsal.address || "",
      opening_time: futsal.opening_time || "",
      closing_time: futsal.closing_time || "",
    });
  };

  const saveFutsal = (futsalId) => {
    if (!form.futsal_name || !form.address) {
      return alert("Name and address are required");
    }

    API.put(`/admin-settings/futsals/${futsalId}`, form)
      .then((res) => {
        alert(res.data.message);
        setEditing(null);
        loadFutsals();
      })
      .catch((err) => alert(err.response?.data?.message || "Update failed"));
  };

  const deleteFutsal = (futsal) => {
    if (!window.confirm(`Delete ${futsal.futsal_name}? Courts and slots may also be removed.`)) {
      return;
    }

    API.delete(`/admin-settings/futsals/${futsal.futsal_id}`)
      .then((res) => {
        alert(res.data.message);
        loadFutsals();
      })
      .catch((err) => alert(err.response?.data?.message || "Delete failed"));
  };

  const uploadImage = (futsalId) => {
    const file = imageFiles[futsalId];
    if (!file) return alert("Choose an image first");

    const data = new FormData();
    data.append("image", file);

    API.put(`/admin/futsals/${futsalId}/image`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        alert(res.data.message);
        setImageFiles((prev) => ({ ...prev, [futsalId]: null }));
        loadFutsals();
      })
      .catch((err) => alert(err.response?.data?.message || "Upload failed"));
  };

  const uploadImageFile = (futsalId, file) => {
    const data = new FormData();
    data.append("image", file);

    return API.put(`/admin/futsals/${futsalId}/image`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const addFutsal = async () => {
    if (!newFutsal.futsal_name || !newFutsal.address) {
      return alert("Futsal name and address are required");
    }

    try {
      setAdding(true);
      const res = await API.post("/admin/futsals", {
        ...newFutsal,
        latitude: newFutsal.latitude || null,
        longitude: newFutsal.longitude || null,
      });

      if (newImage && res.data.futsal_id) {
        await uploadImageFile(res.data.futsal_id, newImage);
      }

      alert(newImage ? "Futsal and image added successfully" : res.data.message);
      setNewFutsal({
        futsal_name: "",
        address: "",
        latitude: "",
        longitude: "",
        opening_time: "07:00",
        closing_time: "20:00",
      });
      setNewImage(null);
      setAddOpen(false);
      loadFutsals();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add futsal");
    } finally {
      setAdding(false);
    }
  };

  const deleteImage = (futsalId) => {
    if (!window.confirm("Delete this futsal image?")) return;

    API.delete(`/admin/futsals/${futsalId}/image`)
      .then((res) => {
        alert(res.data.message);
        loadFutsals();
      })
      .catch((err) => alert(err.response?.data?.message || "Delete image failed"));
  };

  const filtered = futsals.filter((f) => {
    const term = search.toLowerCase();
    return (
      (f.futsal_name || "").toLowerCase().includes(term) ||
      (f.address || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="t-bg-base min-h-screen t-text pt-28 pb-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">Manage Futsals</h1>
            <p className="mt-2 t-text-muted">
              View, edit, delete, manage images, and open court controls for every futsal.
            </p>
          </div>
          <button
            onClick={() => setAddOpen((open) => !open)}
            className="bg-emerald-500 text-slate-900 px-5 py-3 rounded-xl font-semibold hover:bg-emerald-400 transition"
          >
            {addOpen ? "Close Form" : "Add Futsal"}
          </button>
        </div>

        {addOpen && (
          <div className="t-card p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Add New Futsal</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                value={newFutsal.futsal_name}
                onChange={(e) => setNewFutsal({ ...newFutsal, futsal_name: e.target.value })}
                className="t-input"
                placeholder="Futsal name"
              />
              <input
                value={newFutsal.address}
                onChange={(e) => setNewFutsal({ ...newFutsal, address: e.target.value })}
                className="t-input"
                placeholder="Address"
              />
              <input
                value={newFutsal.latitude}
                onChange={(e) => setNewFutsal({ ...newFutsal, latitude: e.target.value })}
                className="t-input"
                placeholder="Latitude optional"
              />
              <input
                value={newFutsal.longitude}
                onChange={(e) => setNewFutsal({ ...newFutsal, longitude: e.target.value })}
                className="t-input"
                placeholder="Longitude optional"
              />
              <input
                type="time"
                value={newFutsal.opening_time}
                onChange={(e) => setNewFutsal({ ...newFutsal, opening_time: e.target.value })}
                className="t-input"
              />
              <input
                type="time"
                value={newFutsal.closing_time}
                onChange={(e) => setNewFutsal({ ...newFutsal, closing_time: e.target.value })}
                className="t-input"
              />
            </div>

            <div className="mt-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold hover:bg-slate-600 transition">
                <ImagePlus size={16} />
                Choose image from laptop
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                />
              </label>
              <span className="ml-3 text-sm t-text-muted">
                {newImage ? newImage.name : "No image selected"}
              </span>
            </div>

            {newImage && (
              <img
                src={URL.createObjectURL(newImage)}
                alt="New futsal preview"
                className="mt-4 h-32 w-56 rounded-xl object-cover border t-border"
              />
            )}

            <button
              onClick={addFutsal}
              disabled={adding}
              className="mt-5 bg-emerald-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-400 disabled:opacity-60 transition"
            >
              {adding ? "Adding..." : "Add Futsal"}
            </button>
          </div>
        )}

        <div className="mb-8 relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 t-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or location..."
            className="t-input w-full pl-9"
          />
        </div>

        {loading ? (
          <p className="t-text-muted animate-pulse">Loading futsals...</p>
        ) : filtered.length === 0 ? (
          <div className="t-card p-12 text-center">
            <Building2 size={36} className="mx-auto mb-3 t-text-muted" />
            <p className="t-text-muted">No futsals found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((futsal, index) => {
              const imageSrc = futsal.image_url
                ? `${API_ORIGIN}${futsal.image_url}`
                : `https://images.unsplash.com/photo-${FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}?w=700&q=75`;

              return (
                <div key={futsal.futsal_id} className="t-card overflow-hidden" style={{ padding: 0 }}>
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={futsal.futsal_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
                      <h3 className="font-bold text-white text-lg leading-tight">
                        {futsal.futsal_name}
                      </h3>
                      <span className="text-xs bg-emerald-500/90 text-slate-950 px-2 py-1 rounded-full font-bold">
                        {futsal.court_count} courts
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    {editing === futsal.futsal_id ? (
                      <div className="space-y-3">
                        <input
                          value={form.futsal_name}
                          onChange={(e) => setForm({ ...form, futsal_name: e.target.value })}
                          className="t-input"
                          placeholder="Futsal name"
                        />
                        <input
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="t-input"
                          placeholder="Address"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="time"
                            value={form.opening_time}
                            onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
                            className="t-input"
                          />
                          <input
                            type="time"
                            value={form.closing_time}
                            onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
                            className="t-input"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveFutsal(futsal.futsal_id)}
                            className="bg-emerald-500 text-slate-900 px-4 py-2 rounded-lg font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="bg-slate-700 px-4 py-2 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm t-text-muted flex items-center gap-1.5 mb-2">
                          <MapPin size={14} />{futsal.address || "No address"}
                        </p>
                        <p className="text-sm t-text-muted flex items-center gap-1.5 mb-4">
                          <Clock size={14} />{futsal.opening_time || "--"} - {futsal.closing_time || "--"}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <button
                            onClick={() => navigate(`/futsal/${futsal.futsal_id}`)}
                            className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1"
                          >
                            View <ArrowRight size={14} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/courts?futsal_id=${futsal.futsal_id}`)}
                            className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-2 rounded-lg text-sm font-semibold"
                          >
                            Courts
                          </button>
                          <button
                            onClick={() => startEdit(futsal)}
                            className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-3 py-2 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1"
                          >
                            <Pencil size={14} />Edit
                          </button>
                          <button
                            onClick={() => deleteFutsal(futsal)}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-2 rounded-lg text-sm font-semibold inline-flex items-center justify-center gap-1"
                          >
                            <Trash2 size={14} />Delete
                          </button>
                        </div>

                        <div className="border-t t-border pt-4">
                          <label className="text-xs t-text-muted mb-2 block">Image</label>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold hover:bg-slate-600 transition">
                            <ImagePlus size={14} />
                            Choose image from laptop
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                setImageFiles((prev) => ({
                                  ...prev,
                                  [futsal.futsal_id]: e.target.files?.[0] || null,
                                }))
                              }
                            />
                          </label>
                          <p className="mt-2 text-xs t-text-muted">
                            {imageFiles[futsal.futsal_id]?.name || "No image selected"}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => uploadImage(futsal.futsal_id)}
                              disabled={!imageFiles[futsal.futsal_id]}
                              className="bg-emerald-500 text-slate-900 px-3 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <ImagePlus size={14} />Upload
                            </button>
                            {futsal.image_url && (
                              <button
                                onClick={() => deleteImage(futsal.futsal_id)}
                                className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-semibold"
                              >
                                Delete Image
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFutsals;
