const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getMatches,
  applyToCompany,
  getApplications,
  updateProfile,
} = require("../controllers/recommendationController");

router.post("/match", authMiddleware, getMatches);
router.post("/apply", authMiddleware, applyToCompany);
router.get("/applications", authMiddleware, getApplications);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
