const path = require("path");
const fs = require("fs-extra");
const { pool } = require("../config/db");
const { parseResume } = require("../services/resumeService");

// POST /api/resume/upload
const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const filePath = req.file.path;

  try {
    const parsed = await parseResume(filePath);

    // Save to DB
    await pool.query(
      "INSERT INTO resumes (user_id, filename, parsed_data) VALUES (?, ?, ?)",
      [req.user.id, req.file.originalname, JSON.stringify(parsed)]
    );

    // Auto-update profile with extracted skills if not already set
    if (parsed.skills && parsed.skills.length > 0) {
      await pool.query(
        "UPDATE profiles SET skills = ? WHERE user_id = ?",
        [JSON.stringify(parsed.skills), req.user.id]
      );
    }

    // Clean up uploaded file
    await fs.remove(filePath);

    return res.json({
      success: true,
      message: "Resume parsed successfully",
      data: parsed,
    });
  } catch (err) {
    console.error("Resume parse error:", err);
    await fs.remove(filePath).catch(() => {});
    return res.status(500).json({ success: false, message: "Failed to parse resume: " + err.message });
  }
};

// GET /api/resume/latest
const getLatestResume = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    const resume = rows[0];
    return res.json({
      success: true,
      data: {
        ...resume,
        parsed_data: JSON.parse(resume.parsed_data || "{}"),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { uploadResume, getLatestResume };
