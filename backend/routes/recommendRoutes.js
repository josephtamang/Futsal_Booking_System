const express = require("express");
const router = express.Router();
const http = require("http");
const auth = require("../middleware/authMiddleware");
const db = require("../db");

const AI_HOST = process.env.AI_HOST || "127.0.0.1";
const AI_PORT = Number(process.env.AI_PORT || 5001);

function isValidCoordinate(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sendNearestFallback({ lat, lng, top_n }, res) {
  const userLat = Number(lat);
  const userLng = Number(lng);
  const limit = Number(top_n) || 5;

  const sql = `
    SELECT futsal_id, futsal_name, address, latitude, longitude,
           opening_time, closing_time
    FROM futsals
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
  `;

  db.query(sql, (err, futsals) => {
    if (err) {
      console.error("Nearest fallback failed:", err.message);
      return res.status(500).json({ message: "Failed to load futsal locations" });
    }

    const recommendations = futsals
      .filter((futsal) => isValidCoordinate(futsal.latitude) && isValidCoordinate(futsal.longitude))
      .map((futsal) => {
        const distance = haversineKm(
          userLat,
          userLng,
          Number(futsal.latitude),
          Number(futsal.longitude)
        );

        return {
          futsal_id: futsal.futsal_id,
          futsal_name: futsal.futsal_name,
          address: futsal.address,
          latitude: Number(futsal.latitude),
          longitude: Number(futsal.longitude),
          opening_time: futsal.opening_time,
          closing_time: futsal.closing_time,
          distance_km: Number(distance.toFixed(2)),
        };
      })
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, limit);

    res.json({
      recommendations,
      strategy: "nearest",
      source: "backend-fallback",
    });
  });
}

function sendPopularFallback({ user_id, top_n }, res) {
  const limit = Number(top_n) || 5;

  const sql = `
    SELECT f.futsal_id, f.futsal_name, f.address,
           f.latitude, f.longitude,
           f.opening_time, f.closing_time,
           COUNT(b.booking_id) AS total_bookings,
           MAX(CASE WHEN b.user_id = ? AND b.status = 'confirmed' THEN 1 ELSE 0 END) AS visited_before
    FROM futsals f
    LEFT JOIN courts c ON f.futsal_id = c.futsal_id
    LEFT JOIN bookings b ON c.court_id = b.court_id
                         AND b.status = 'confirmed'
    GROUP BY f.futsal_id, f.futsal_name, f.address,
             f.latitude, f.longitude, f.opening_time, f.closing_time
    ORDER BY total_bookings DESC, f.futsal_name ASC
    LIMIT ?
  `;

  db.query(sql, [user_id || 0, limit], (err, futsals) => {
    if (err) {
      console.error("Popular fallback failed:", err.message);
      return res.status(500).json({ message: "Failed to load popular futsals" });
    }

    const recommendations = futsals.map((futsal) => ({
      futsal_id: futsal.futsal_id,
      futsal_name: futsal.futsal_name,
      address: futsal.address,
      latitude: isValidCoordinate(futsal.latitude) ? Number(futsal.latitude) : null,
      longitude: isValidCoordinate(futsal.longitude) ? Number(futsal.longitude) : null,
      opening_time: futsal.opening_time,
      closing_time: futsal.closing_time,
      total_bookings: Number(futsal.total_bookings),
      visited_before: Boolean(futsal.visited_before),
    }));

    res.json({
      recommendations,
      strategy: "popular",
      source: "backend-fallback",
    });
  });
}

function forwardToAI(path, body, res, fallback) {
  const payload = JSON.stringify(body);

  const options = {
    hostname: AI_HOST,
    port: AI_PORT,
    path,
    method: "POST",
    timeout: 3000,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  const req = http.request(options, (aiRes) => {
    let data = "";

    aiRes.on("data", (chunk) => {
      data += chunk;
    });

    aiRes.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        if (aiRes.statusCode >= 500) {
          return fallback();
        }
        res.status(aiRes.statusCode).json(parsed);
      } catch {
        fallback();
      }
    });
  });

  req.on("timeout", () => {
    req.destroy(new Error("AI service timed out"));
  });

  req.on("error", (err) => {
    console.error("AI service unavailable, using backend fallback:", err.message);
    fallback();
  });

  req.write(payload);
  req.end();
}

router.post("/nearest", auth, (req, res) => {
  const { lat, lng, top_n } = req.body;

  if (!isValidCoordinate(lat) || !isValidCoordinate(lng)) {
    return res.status(400).json({ message: "lat and lng are required" });
  }

  const body = { lat, lng, top_n: top_n || 5 };
  forwardToAI("/recommend/nearest", body, res, () => sendNearestFallback(body, res));
});

router.post("/popular", auth, (req, res) => {
  const { top_n } = req.body;
  const user_id = req.user.user_id;

  const body = { user_id, top_n: top_n || 5 };
  forwardToAI("/recommend/popular", body, res, () => sendPopularFallback(body, res));
});

module.exports = router;
