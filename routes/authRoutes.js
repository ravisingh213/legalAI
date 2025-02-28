const express = require("express");
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddileware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/changePassword",authMiddleware, changePassword);

module.exports = router;
