require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { initDB } = require("./config/db");

const app = express();

// =====================================
// Security & Middleware
// =====================================
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// =====================================
// Routes
// =====================================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));

// =====================================
// Health Check
// =====================================
app.get("/api/status", (req, res) => {
  res.json({ success: true, status: "Online", timestamp: new Date() });
});

app.get("/", (req, res) => {
  res.json({ project: "CareerMatrix AI", version: "1.0.0", status: "Running" });
});

// =====================================
// 404
// =====================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// =====================================
// Global Error Handler
// =====================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// =====================================
// Start
// =====================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await initDB();
  console.log(`\n====================================`);
  console.log(`  CareerMatrix AI Backend`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`====================================\n`);
});
