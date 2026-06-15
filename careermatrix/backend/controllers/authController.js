const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { sendWelcomeEmail } = require("../services/emailService");

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

// POST /api/auth/signup
const signup = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Name, email, and password are required",
      });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be at least 8 characters",
      });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({
          success: false,
          message: "An account with this email already exists",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, phone || null],
    );

    const userId = result.insertId;

    // Create empty profile
    await pool.query("INSERT INTO profiles (user_id) VALUES (?)", [userId]);

    const user = { id: userId, email, name };
    const token = generateToken(user);

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ to: email, name }).catch((err) =>
      console.warn("Welcome email failed:", err.message),
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: { id: userId, name, email },
    });
  } catch (err) {
    console.error("Signup error FULL:", err); // ← change this line
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      debug: err.message, // ← add this temporarily
    });
  }
};

// POST /api/auth/signin
const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "No account found with this email" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Signed in successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signin error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during sign in" });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT u.id, u.name, u.email, u.phone, u.created_at, p.preferred_role, p.preferred_duration, p.skills, p.interests, p.experience_years, p.education_level, p.preferred_location, p.salary_expectation, p.remote_preference FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = users[0];
    return res.json({
      success: true,
      user: {
        ...user,
        skills: user.skills ? JSON.parse(user.skills) : [],
        interests: user.interests ? JSON.parse(user.interests) : [],
      },
    });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { signup, signin, getMe };
