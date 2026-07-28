const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");

// Create booking (date-based safe booking)
router.post("/", auth, (req, res) => {
  const { court_id, slot_id, booking_date } = req.body;
  const user_id = req.user.user_id;
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kathmandu",
  });

  if (!booking_date || booking_date < today) {
    return res
      .status(400)
      .json({ message: "Please select today or a future date" });
  }

  // Check if slot already booked for that date
  const checkSql = `
    SELECT booking_id
    FROM bookings
    WHERE court_id = ?
      AND slot_id = ?
      AND booking_date = ?
      AND status = 'confirmed'
  `;

  db.query(
    checkSql,
    [court_id, slot_id, booking_date],
    (err, existing) => {
      if (existing.length > 0) {
        return res
          .status(400)
          .json({ message: "Slot already booked" });
      }

      const insertSql = `
        INSERT INTO bookings (user_id, court_id, slot_id, booking_date)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [user_id, court_id, slot_id, booking_date],
        (err) => {
          if (err) {
            return res.status(500).json({ message: "Booking failed" });
          }

          res.json({ message: "Booking confirmed 🎉" });
        }
      );
    }
  );
});




// Get booking history for logged-in user
router.get("/my-bookings", auth, (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT 
      b.booking_id,
      b.booking_date,
      b.status,
      f.futsal_name,
      c.court_name,
      t.start_time,
      t.end_time
    FROM bookings b
    JOIN courts c ON b.court_id = c.court_id
    JOIN futsals f ON c.futsal_id = f.futsal_id
    JOIN time_slots t ON b.slot_id = t.slot_id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching bookings" });
    }
    res.json(results);
  });
});




// User cancels own booking
router.put("/cancel/:booking_id", auth, (req, res) => {
  const booking_id = req.params.booking_id;
  const user_id = req.user.user_id;

  // Ensure booking belongs to this user
  const checkSql = `
    SELECT booking_id
    FROM bookings
    WHERE booking_id = ? AND user_id = ?
  `;

  db.query(checkSql, [booking_id, user_id], (err, result) => {
    if (err || result.length === 0) {
      return res
        .status(403)
        .json({ message: "Not allowed" });
    }

    const cancelSql = `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE booking_id = ?
    `;

    db.query(cancelSql, [booking_id], () => {
      res.json({ message: "Booking cancelled successfully" });
    });
  });
});


module.exports = router;
