const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");


/**
 * Get ALL slots for a court (never hide slots)
 */
// USER: get only ACTIVE slots
router.get("/:court_id", (req, res) => {
  const sql = `
    SELECT slot_id, court_id, start_time, end_time
    FROM time_slots
    WHERE court_id = ?
      AND is_available = 1
    ORDER BY start_time
  `;

  db.query(sql, [req.params.court_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error loading slots" });
    }
    res.json(results);
  });
});



/**
 * Get booked slot IDs for a court on a specific date
 */
router.get(
  "/booked-slots/:court_id/:date",
  auth,
  (req, res) => {
    const { court_id, date } = req.params;

    const sql = `
      SELECT slot_id
      FROM bookings
      WHERE court_id = ?
        AND booking_date = ?
        AND status = 'confirmed'
    `;

    db.query(sql, [court_id, date], (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching booked slots" });
      }

      res.json(results.map((r) => r.slot_id));
    });
  }
);




module.exports = router;
