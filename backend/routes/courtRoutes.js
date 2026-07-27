const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");


// Get courts by futsal
// GET courts by futsal (only active)
// USER: get only ACTIVE courts
router.get("/:futsal_id", (req, res) => {
  const sql = `
    SELECT 
      court_id,
      futsal_id,
      court_name,
      court_type,
      price_per_hour
    FROM courts
    WHERE futsal_id = ?
      AND is_active = 1
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






module.exports = router;
