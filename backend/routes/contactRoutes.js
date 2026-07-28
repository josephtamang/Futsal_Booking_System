const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Admin: view submitted contact messages
router.get("/", auth, admin, (req, res) => {
  const sql = `
    SELECT id, name, email, message, created_at
    FROM contact_messages
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to load messages" });
    }

    res.json(results);
  });
});

// Submit contact form
router.post("/", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    INSERT INTO contact_messages (name, email, message)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [name, email, message], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to send message" });
    }

    res.json({ message: "Message sent successfully" });
  });
});

module.exports = router;
