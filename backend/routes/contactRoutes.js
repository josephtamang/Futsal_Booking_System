const express = require("express");
const router = express.Router();
const db = require("../db");

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
