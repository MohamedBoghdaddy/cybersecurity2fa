// routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  verifyOTP,
} from "../controller/authController.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login → sends OTP
router.post("/login", loginUser);

// Verify OTP
router.post("/verify-otp", verifyOTP);

export default router;
