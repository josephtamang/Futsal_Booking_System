"""
RinCon FutBuk — AI Recommendation Service
Flask microservice using scikit-learn to recommend futsals.

Two recommendation strategies:
  1. Nearest futsal  — uses Haversine distance via NearestNeighbors
  2. Popular futsal  — uses booking frequency as a popularity score
     (fallback when user has no booking history)

Run:  python app.py
Port: 5001
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import mysql.connector
from sklearn.neighbors import NearestNeighbors
import math
import os

app = Flask(__name__)
CORS(app)

# ─── DB config — must match your backend/db.js ───────────────────────────────
DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "user":     os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "J9808039154t"),
    "database": os.getenv("DB_NAME", "futsal_booking"),
}


def get_db():
    return mysql.connector.connect(**DB_CONFIG)


# ─── Haversine distance (km) ──────────────────────────────────────────────────
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1))
         * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ─── /recommend/nearest ───────────────────────────────────────────────────────
# Body: { "lat": float, "lng": float, "top_n": int (optional, default 5) }
# Returns futsals sorted by distance from the user's location.
@app.route("/recommend/nearest", methods=["POST"])
def recommend_nearest():
    data = request.get_json()
    user_lat = data.get("lat")
    user_lng = data.get("lng")
    top_n    = int(data.get("top_n", 5))

    if user_lat is None or user_lng is None:
        return jsonify({"error": "lat and lng are required"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT futsal_id, futsal_name, address, latitude, longitude, "
        "opening_time, closing_time FROM futsals "
        "WHERE latitude IS NOT NULL AND longitude IS NOT NULL"
    )
    futsals = cursor.fetchall()
    cursor.close()
    conn.close()

    if not futsals:
        return jsonify({"recommendations": [], "message": "No futsals with location data"})

    # Build coordinate matrix for NearestNeighbors
    coords = np.array([[float(f["latitude"]), float(f["longitude"])] for f in futsals])
    user_coords = np.array([[float(user_lat), float(user_lng)]])

    k = min(top_n, len(futsals))
    model = NearestNeighbors(n_neighbors=k, algorithm="ball_tree",
                             metric="haversine")
    model.fit(np.radians(coords))          # NearestNeighbors haversine needs radians
    distances, indices = model.kneighbors(np.radians(user_coords))

    results = []
    for dist_rad, idx in zip(distances[0], indices[0]):
        f = futsals[idx]
        dist_km = dist_rad * 6371          # convert back to km
        results.append({
            "futsal_id":    f["futsal_id"],
            "futsal_name":  f["futsal_name"],
            "address":      f["address"],
            "latitude":     float(f["latitude"]) if f["latitude"] else None,
            "longitude":    float(f["longitude"]) if f["longitude"] else None,
            "opening_time": str(f["opening_time"]) if f["opening_time"] else None,
            "closing_time": str(f["closing_time"]) if f["closing_time"] else None,
            "distance_km":  round(dist_km, 2),
        })

    return jsonify({"recommendations": results, "strategy": "nearest"})


# ─── /recommend/popular ───────────────────────────────────────────────────────
# Body: { "user_id": int (optional), "top_n": int (optional, default 5) }
# Returns futsals ranked by confirmed booking count.
# If user_id is provided, boosts futsals the user has visited before.
@app.route("/recommend/popular", methods=["POST"])
def recommend_popular():
    data    = request.get_json()
    user_id = data.get("user_id")
    top_n   = int(data.get("top_n", 5))

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    # Global booking counts per futsal
    cursor.execute("""
        SELECT f.futsal_id, f.futsal_name, f.address,
               f.latitude, f.longitude,
               f.opening_time, f.closing_time,
               COUNT(b.booking_id) AS total_bookings
        FROM futsals f
        LEFT JOIN courts c ON f.futsal_id = c.futsal_id
        LEFT JOIN bookings b ON c.court_id = b.court_id
                             AND b.status = 'confirmed'
        GROUP BY f.futsal_id
        ORDER BY total_bookings DESC
    """)
    futsals = cursor.fetchall()

    # User's personal booking history (futsal_ids visited)
    user_visited = set()
    if user_id:
        cursor.execute("""
            SELECT DISTINCT f.futsal_id
            FROM bookings b
            JOIN courts c ON b.court_id = c.court_id
            JOIN futsals f ON c.futsal_id = f.futsal_id
            WHERE b.user_id = %s AND b.status = 'confirmed'
        """, (user_id,))
        user_visited = {row["futsal_id"] for row in cursor.fetchall()}

    cursor.close()
    conn.close()

    if not futsals:
        return jsonify({"recommendations": [], "message": "No futsal data"})

    # Build score array: base = normalized booking count, boost visited
    counts = np.array([f["total_bookings"] for f in futsals], dtype=float)
    max_count = counts.max() if counts.max() > 0 else 1
    scores = counts / max_count                 # 0..1 normalized popularity

    for i, f in enumerate(futsals):
        if f["futsal_id"] in user_visited:
            scores[i] += 0.5                    # personal history boost

    ranked_indices = np.argsort(scores)[::-1][:top_n]

    results = []
    for idx in ranked_indices:
        f = futsals[idx]
        results.append({
            "futsal_id":       f["futsal_id"],
            "futsal_name":     f["futsal_name"],
            "address":         f["address"],
            "latitude":        float(f["latitude"]) if f["latitude"] else None,
            "longitude":       float(f["longitude"]) if f["longitude"] else None,
            "opening_time":    str(f["opening_time"]) if f["opening_time"] else None,
            "closing_time":    str(f["closing_time"]) if f["closing_time"] else None,
            "total_bookings":  int(f["total_bookings"]),
            "visited_before":  f["futsal_id"] in user_visited,
        })

    return jsonify({"recommendations": results, "strategy": "popular"})


# ─── /health ─────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "RinCon AI Recommendation"})


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5001, debug=True)
