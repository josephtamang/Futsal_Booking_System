const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");

function todayInKathmandu() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kathmandu",
  });
}

function currentMinutesInKathmandu() {
  const currentTime = new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [hour, minute] = currentTime.split(":").map(Number);
  return hour * 60 + minute;
}

function timeToMinutes(time) {
  const [hour, minute] = String(time).split(":").map(Number);
  return hour * 60 + minute;
}

// Create booking (date and time safe booking)
router.post("/", auth, (req, res) => {
  const { court_id, slot_id, booking_date } = req.body;
  const user_id = req.user.user_id;
  const today = todayInKathmandu();

  if (!booking_date || booking_date < today) {
    return res
      .status(400)
      .json({ message: "Please select today or a future date" });
  }

  const slotSql =
    `SELECT start_time
     FROM time_slots
     WHERE slot_id = ?
       AND court_id = ?
       AND is_available = 1
       AND is_active = 1`;

  db.query(slotSql, [slot_id, court_id], (slotErr, slotRows) => {
    if (slotErr || slotRows.length === 0) {
      return res.status(400).json({ message: "Invalid slot selected" });
    }

    if (
      booking_date === today &&
      timeToMinutes(slotRows[0].start_time) <= currentMinutesInKathmandu()
    ) {
      return res
        .status(400)
        .json({ message: "This slot is no longer available today" });
    }

    const checkSql = `
      SELECT booking_id
      FROM bookings
      WHERE court_id = ?
        AND slot_id = ?
        AND booking_date = ?
        AND status = 'confirmed'
    `;

    db.query(checkSql, [court_id, slot_id, booking_date], (err, existing) => {
      if (err) {
        return res.status(500).json({ message: "Booking failed" });
      }

      if (existing.length > 0) {
        return res.status(400).json({ message: "Slot already booked" });
      }

      const insertSql = `
        INSERT INTO bookings (user_id, court_id, slot_id, booking_date)
        VALUES (?, ?, ?, ?)
      `;

      db.query(insertSql, [user_id, court_id, slot_id, booking_date], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ message: "Booking failed" });
        }

        res.json({ message: "Booking confirmed" });
      });
    });
  });
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
