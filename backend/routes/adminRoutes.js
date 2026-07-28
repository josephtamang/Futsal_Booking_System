const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Add futsal
router.post("/futsals", auth, admin, (req, res) => {
  const { futsal_name, address, latitude, longitude, opening_time, closing_time } = req.body;

  const sql = `
    INSERT INTO futsals 
    (futsal_name, address, latitude, longitude, opening_time, closing_time)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [futsal_name, address, latitude, longitude, opening_time, closing_time], (err) => {
    if (err) return res.status(500).json({ message: "Failed to add futsal" });
    res.json({ message: "Futsal added successfully" });
  });
});


// View all bookings (WITH SLOT TIME)
router.get("/bookings", auth, admin, (req, res) => {
  const { date, status } = req.query;

  let sql = `
    SELECT 
      b.booking_id,
      b.booking_date,
      b.status,
      u.full_name,
      f.futsal_name,
      c.court_name,
      s.start_time,
      s.end_time
    FROM bookings b
    JOIN users u ON b.user_id = u.user_id
    JOIN courts c ON b.court_id = c.court_id
    JOIN futsals f ON c.futsal_id = f.futsal_id
    JOIN time_slots s ON b.slot_id = s.slot_id
    WHERE 1=1
  `;

  const params = [];

  if (date) {
  sql += ` AND b.booking_date = ?`;
  params.push(date);
}


  if (status && status !== "all") {
    sql += ` AND b.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY b.booking_date DESC, s.start_time ASC`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error loading bookings" });
    }
    res.json(results);
  });
});




// Add court to futsal
router.post("/courts", auth, admin, (req, res) => {
  const { futsal_id, court_name, court_type, price_per_hour } = req.body;

  const sql = `
    INSERT INTO courts (futsal_id, court_name, court_type, price_per_hour)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [futsal_id, court_name, court_type, price_per_hour], (err) => {
    if (err) return res.status(500).json({ message: "Failed to add court" });
    res.json({ message: "Court added successfully" });
  });
});



// Add time slot to court
router.post("/slots", auth, admin, (req, res) => {
  const { court_id, start_time, end_time } = req.body;

  const startHour = Number(String(start_time).split(":")[0]);
  const endHour = Number(String(end_time).split(":")[0]);

  if (!court_id || !start_time || !end_time) {
    return res.status(400).json({ message: "Court, start time, and end time are required" });
  }

  if (startHour < 7 || endHour > 20 || endHour - startHour !== 1) {
    return res.status(400).json({
      message: "Slots must be one hour between 07:00 and 20:00",
    });
  }

  const sql = `
    INSERT INTO time_slots (court_id, start_time, end_time, is_available, is_active)
    SELECT ?, ?, ?, 1, 1
    WHERE NOT EXISTS (
      SELECT 1
      FROM time_slots
      WHERE court_id = ?
        AND start_time = ?
        AND end_time = ?
    )
  `;

  db.query(sql, [court_id, start_time, end_time, court_id, start_time, end_time], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to add slot" });
    if (result.affectedRows === 0) {
      return res.status(409).json({ message: "This time slot already exists" });
    }
    res.json({ message: "Time slot added successfully" });
  });
});




// Admin cancels any booking
router.put("/cancel-booking/:booking_id", auth, admin, (req, res) => {
  const booking_id = req.params.booking_id;

  const getSlotSql = "SELECT slot_id FROM bookings WHERE booking_id = ?";

  db.query(getSlotSql, [booking_id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const slot_id = result[0].slot_id;

    const cancelSql =
      "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?";

    db.query(cancelSql, [booking_id], () => {
      const slotSql =
        "UPDATE time_slots SET is_available = true WHERE slot_id = ?";

      db.query(slotSql, [slot_id]);
      res.json({ message: "Booking cancelled by admin" });
    });
  });
});

// Disable court (Admin)
router.put("/courts/:court_id/disable", auth, admin, (req, res) => {
  const { court_id } = req.params;

  const sql = "UPDATE courts SET is_active = false WHERE court_id = ?";

  db.query(sql, [court_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to disable court" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Court not found" });
    }

    res.json({ message: "Court disabled successfully" });
  });
});


// Enable court (Admin)
router.put("/courts/:court_id/enable", auth, admin, (req, res) => {
  const { court_id } = req.params;

  const sql = "UPDATE courts SET is_active = true WHERE court_id = ?";

  db.query(sql, [court_id], (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to enable court" });
    }
    res.json({ message: "Court enabled successfully" });
  });
});




// Disable slot
router.put("/slots/:slot_id/disable", auth, admin, (req, res) => {
  const { slot_id } = req.params;

  const sql = `
    UPDATE time_slots
    SET is_active = 0,
        is_available = 0
    WHERE slot_id = ?
  `;

  db.query(sql, [slot_id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to disable slot" });
    }

    res.json({ message: "Slot disabled successfully" });
  });
});

// Enable slot
router.put("/slots/:slot_id/enable", auth, admin, (req, res) => {
  const { slot_id } = req.params;

  const sql = `
    UPDATE time_slots
    SET is_active = 1,
        is_available = 1
    WHERE slot_id = ?
  `;

  db.query(sql, [slot_id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to enable slot" });
    }

    res.json({ message: "Slot enabled successfully" });
  });
});



// ADMIN: get all courts (active + disabled)
router.get("/courts/:futsal_id", auth, admin, (req, res) => {
  const sql = `
    SELECT 
      court_id,
      futsal_id,
      court_name,
      court_type,
      price_per_hour,
      is_active
    FROM courts
    WHERE futsal_id = ?
    ORDER BY court_name
  `;

  db.query(sql, [req.params.futsal_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error loading courts" });
    }
    res.json(results);
  });
});


// ADMIN: get all slots of a court
router.get("/slots/court/:court_id", auth, admin, (req, res) => {
  const sql = `
    SELECT slot_id, court_id, start_time, end_time, is_available, is_active
    FROM time_slots
    WHERE court_id = ?
    ORDER BY start_time
  `;

  db.query(sql, [req.params.court_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error loading slots" });
    }
    res.json(results);
  });
});





module.exports = router;
