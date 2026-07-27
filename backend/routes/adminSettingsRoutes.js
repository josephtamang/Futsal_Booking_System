const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// ─────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────

// GET all users
router.get("/users", auth, admin, (req, res) => {
  const sql = `
    SELECT user_id, full_name, email, phone, role, created_at
    FROM users
    ORDER BY created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to load users" });
    res.json(results);
  });
});

// DEACTIVATE user (set role to 'banned' conceptually — we mark via a status column if exists, else we use role flag)
// Since your schema only has role, we'll block by setting role = 'banned'
router.put("/users/:user_id/deactivate", auth, admin, (req, res) => {
  const { user_id } = req.params;
  // Prevent admin from banning themselves
  if (parseInt(user_id) === req.user.user_id) {
    return res.status(400).json({ message: "You cannot deactivate your own account" });
  }
  db.query(
    "UPDATE users SET role = 'banned' WHERE user_id = ? AND role = 'user'",
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to deactivate user" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "User not found or already deactivated" });
      res.json({ message: "User deactivated successfully" });
    }
  );
});

// REACTIVATE user
router.put("/users/:user_id/activate", auth, admin, (req, res) => {
  const { user_id } = req.params;
  db.query(
    "UPDATE users SET role = 'user' WHERE user_id = ? AND role = 'banned'",
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to activate user" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "User not found or already active" });
      res.json({ message: "User activated successfully" });
    }
  );
});

// ─────────────────────────────────────────────
// FUTSAL MANAGEMENT
// ─────────────────────────────────────────────

// GET all futsals with court count
router.get("/futsals", auth, admin, (req, res) => {
  const sql = `
    SELECT 
      f.futsal_id,
      f.futsal_name,
      f.address,
      f.opening_time,
      f.closing_time,
      COUNT(c.court_id) AS court_count
    FROM futsals f
    LEFT JOIN courts c ON f.futsal_id = c.futsal_id
    GROUP BY f.futsal_id
    ORDER BY f.futsal_name
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to load futsals" });
    res.json(results);
  });
});

// UPDATE futsal details
router.put("/futsals/:futsal_id", auth, admin, (req, res) => {
  const { futsal_id } = req.params;
  const { futsal_name, address, opening_time, closing_time } = req.body;

  if (!futsal_name || !address) {
    return res.status(400).json({ message: "Name and address are required" });
  }

  const sql = `
    UPDATE futsals 
    SET futsal_name = ?, address = ?, opening_time = ?, closing_time = ?
    WHERE futsal_id = ?
  `;
  db.query(sql, [futsal_name, address, opening_time, closing_time, futsal_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to update futsal" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Futsal not found" });
    res.json({ message: "Futsal updated successfully" });
  });
});

// DELETE futsal
router.delete("/futsals/:futsal_id", auth, admin, (req, res) => {
  const { futsal_id } = req.params;
  db.query("DELETE FROM futsals WHERE futsal_id = ?", [futsal_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete futsal" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Futsal not found" });
    res.json({ message: "Futsal deleted successfully" });
  });
});

// ─────────────────────────────────────────────
// STATS / REPORTS
// ─────────────────────────────────────────────

router.get("/stats", auth, admin, (req, res) => {
  const queries = {
    totalUsers:    "SELECT COUNT(*) AS count FROM users WHERE role = 'user'",
    totalBookings: "SELECT COUNT(*) AS count FROM bookings",
    confirmedBookings: "SELECT COUNT(*) AS count FROM bookings WHERE status = 'confirmed'",
    cancelledBookings: "SELECT COUNT(*) AS count FROM bookings WHERE status = 'cancelled'",
    totalFutsals:  "SELECT COUNT(*) AS count FROM futsals",
    totalCourts:   "SELECT COUNT(*) AS count FROM courts",
    recentBookings: `
      SELECT 
        b.booking_date, b.status,
        u.full_name,
        f.futsal_name,
        c.court_name
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      JOIN courts c ON b.court_id = c.court_id
      JOIN futsals f ON c.futsal_id = f.futsal_id
      ORDER BY b.booking_date DESC
      LIMIT 5
    `,
    topFutsals: `
      SELECT f.futsal_name, COUNT(b.booking_id) AS total_bookings
      FROM bookings b
      JOIN courts c ON b.court_id = c.court_id
      JOIN futsals f ON c.futsal_id = f.futsal_id
      WHERE b.status = 'confirmed'
      GROUP BY f.futsal_id
      ORDER BY total_bookings DESC
      LIMIT 5
    `,
  };

  const results = {};
  let done = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, sql]) => {
    db.query(sql, (err, rows) => {
      if (err) {
        results[key] = null;
      } else {
        results[key] = rows[0]?.count !== undefined ? rows[0].count : rows;
      }
      done++;
      if (done === total) res.json(results);
    });
  });
});

module.exports = router;
