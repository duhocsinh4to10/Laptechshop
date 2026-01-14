import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // Tự động xoá document này sau 10 phút
    expires: 600, // 10 phút (tính bằng giây)
  },
});

const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
