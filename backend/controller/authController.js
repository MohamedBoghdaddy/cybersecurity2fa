// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import { sendOTP } from "../utils/sendOTP.js";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const createToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

/**
 * =================================================================
 * REGISTER USER
 * =================================================================
 */
export const registerUser = async (req, res) => {
  try {
    console.log("📩 REGISTER REQUEST BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ message: "Email and password required" });
    }

    let user = await User.findOne({ email });
    console.log("🔍 Checking if user exists:", user);

    if (user) {
      console.log("❌ Email already exists");
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    console.log("🔐 Hashed password:", hashed);
    console.log("🔢 Generated OTP:", otp);

    user = await User.create({
      email,
      password: hashed,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
    });

    console.log("✅ User created:", user);

    console.log("📧 Sending OTP email...");
    await sendOTP(email, otp);
    console.log("📨 OTP email sent");

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * =================================================================
 * LOGIN → SEND OTP
 * =================================================================
 */
export const loginUser = async (req, res) => {
  try {
    console.log("📩 LOGIN REQUEST BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ Missing login email or password");
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    console.log("🔍 Found user:", user);

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found." });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("🔑 Password match:", match);

    if (!match) {
      console.log("❌ Invalid password");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = generateOTP();
    console.log("🔢 Generated OTP:", otp);

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    console.log("💾 Saved OTP to user");

    console.log("📧 Sending OTP email...");
    await sendOTP(email, otp);
    console.log("📨 OTP email sent");

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * =================================================================
 * VERIFY OTP
 * =================================================================
 */
export const verifyOTP = async (req, res) => {
  try {
    console.log("📩 VERIFY OTP REQUEST BODY:", req.body);

    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    console.log("🔍 User found:", user);

    if (!user) {
      console.log("❌ User not found for OTP");
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.otp || user.otp !== otp) {
      console.log("❌ Invalid OTP entered");
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      console.log("❌ OTP expired");
      return res.status(400).json({ message: "OTP expired" });
    }

    console.log("🔓 OTP verified, updating user status...");

    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    await user.save();

    const token = createToken(user);

    console.log("🎫 Token created:", token);

    return res.json({
      success: true,
      message: "OTP Verified",
      token,
    });
  } catch (error) {
    console.error("❌ VERIFY ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};
