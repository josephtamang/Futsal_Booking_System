const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");

// Get all futsals
router.get("/", (req, res) => {
  const sql = "SELECT * FROM futsals";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching futsals" });
    }
    res.json(results);
  });
});

module.exports = router;
