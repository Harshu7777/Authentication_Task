const express = require("express");
const router = express.Router();
const {
  RegisterUser,
  LoginUser,
  sendOtpEmail,
  verifyOtp,
  refreshAccessToken,
  LogoutUser,
  getUserProfile,
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

// User registration and login
router.post("/register", RegisterUser);
router.post("/login", LoginUser);

// User profile (protected route)
router.get("/profile/:id", verifyToken , getUserProfile);  

// OTP management
router.post("/send-otp", sendOtpEmail);
router.get("/verify-otp", verifyOtp);  

// Refresh token
router.post("/refresh-token", refreshAccessToken);

// User logout
router.post("/logout", LogoutUser);

module.exports = router;
