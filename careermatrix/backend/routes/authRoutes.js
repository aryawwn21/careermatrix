const express = require("express");
const router = express.Router();
const { signup, signin, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", authMiddleware, getMe);

module.exports = router;
