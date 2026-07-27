const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const auth = require("../middleware/authMiddleware");

// GET current user profile
router.get("/", auth, (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT user_id, full_name, email, phone, role, created_at
    FROM users
    WHERE user_id = ?
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Failed to load profile" });
    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json(results[0]);
  });
});

// UPDATE profile (full_name, phone)
router.put("/update", auth, (req, res) => {
  const user_id = req.user.user_id;
  const { full_name, phone } = req.body;

  if (!full_name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  const sql = `
    UPDATE users SET full_name = ?, phone = ? WHERE user_id = ?
  `;

  db.query(sql, [full_name, phone, user_id], (err) => {
    if (err) return res.status(500).json({ message: "Failed to update profile" });
    res.json({ message: "Profile updated successfully" });
  });
});

// CHANGE PASSWORD
router.put("/change-password", auth, (req, res) => {
  const user_id = req.user.user_id;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ message: "Both passwords are required" });
  }

  if (new_password.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters" });
  }

  // Fetch current hashed password
  const sql = "SELECT password FROM users WHERE user_id = ?";

  db.query(sql, [user_id], async (err, results) => {
    if (err || results.length === 0)
      return res.status(500).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(
      current_password,
      results[0].password
    );

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    db.query(
      "UPDATE users SET password = ? WHERE user_id = ?",
      [hashed, user_id],
      (err2) => {
        if (err2)
          return res
            .status(500)
            .json({ message: "Failed to change password" });
        res.json({ message: "Password changed successfully" });
      }
    );
  });
});

module.exports = router;
