const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER API
router.post("/register", async (req, res) => {
  const { full_name, email, password, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)";

    db.query(sql, [full_name, email, hashedPassword, phone], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "User already exists" });
      }

      res.json({ message: "Registration successful" });
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// LOGIN API
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (result.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        "secret_key",
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

module.exports = router;
