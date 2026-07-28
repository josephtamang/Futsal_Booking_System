const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const db = require("../db");
const bcrypt = require("bcrypt");
const auth = require("../middleware/authMiddleware");

const uploadDir = path.join(__dirname, "..", "uploads", "profiles");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${req.user.user_id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

function deleteLocalImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/profiles/")) return;

  const relativePath = imageUrl.replace(/^\/uploads\//, "uploads/");
  const filePath = path.join(__dirname, "..", relativePath);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") console.error(err);
  });
}

db.query("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL", (err) => {
  if (err && err.code !== "ER_DUP_FIELDNAME") console.error(err);
});

// GET current user profile
router.get("/", auth, (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT user_id, full_name, email, phone, role, profile_image, created_at
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

// UPLOAD or replace profile image
router.put("/image", auth, upload.single("image"), (req, res) => {
  const user_id = req.user.user_id;

  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

  const imageUrl = `/uploads/profiles/${req.file.filename}`;

  db.query(
    "SELECT profile_image FROM users WHERE user_id = ?",
    [user_id],
    (selectErr, rows) => {
      if (selectErr || rows.length === 0) {
        deleteLocalImage(imageUrl);
        return res.status(500).json({ message: "Failed to load profile" });
      }

      db.query(
        "UPDATE users SET profile_image = ? WHERE user_id = ?",
        [imageUrl, user_id],
        (updateErr) => {
          if (updateErr) {
            deleteLocalImage(imageUrl);
            return res.status(500).json({ message: "Failed to update profile image" });
          }

          deleteLocalImage(rows[0].profile_image);
          res.json({
            message: "Profile image updated successfully",
            profile_image: imageUrl,
          });
        }
      );
    }
  );
});

// DELETE profile image
router.delete("/image", auth, (req, res) => {
  const user_id = req.user.user_id;

  db.query(
    "SELECT profile_image FROM users WHERE user_id = ?",
    [user_id],
    (selectErr, rows) => {
      if (selectErr || rows.length === 0) {
        return res.status(500).json({ message: "Failed to load profile" });
      }

      db.query(
        "UPDATE users SET profile_image = NULL WHERE user_id = ?",
        [user_id],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ message: "Failed to delete profile image" });
          }

          deleteLocalImage(rows[0].profile_image);
          res.json({ message: "Profile image deleted successfully" });
        }
      );
    }
  );
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
