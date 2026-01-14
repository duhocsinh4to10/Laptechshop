import express from "express";
const router = express.Router();
import {
  loginUser,
  registerUser,
  verifyEmail, // <-- IMPORT
  loginWithGoogle,
  sendOtp,
  verifyOtpAndRegister,
} from "../controllers/authController.js";

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/google-login", loginWithGoogle);
router.post("/verify-email", verifyEmail); // <-- THÊM ROUTE MỚI

// (Các route OTP cho SĐT nếu có)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);

export default router;
