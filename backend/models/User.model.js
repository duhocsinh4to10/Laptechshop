import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: {
      type: String,
      required: false, // Có thể không bắt buộc khi đăng ký ban đầu
      unique: true,
      sparse: true, // Cho phép nhiều giá trị null/undefined
    },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    isVerified: { type: Boolean, default: false },

    // --- THÊM CÁC TRƯỜNG PROFILE MỚI ---
    gender: {
      type: String,
      enum: ["Nam", "Nữ", "Khác"], // Chỉ cho phép các giá trị này
      required: false, // Có thể không bắt buộc
    },
    address: {
      street: { type: String, required: false }, // Số nhà, tên đường
      ward: { type: String, required: false }, // Phường/Xã
      district: { type: String, required: false }, // Quận/Huyện
      province: { type: String, required: false }, // Tỉnh/Thành phố
    },
    idCardNumber: {
      type: String,
      required: false, // Có thể không bắt buộc
      // unique: true, // Cân nhắc nếu cần CCCD là duy nhất
      // sparse: true,
    },
    // --- KẾT THÚC THÊM TRƯỜNG MỚI ---
  },
  {
    timestamps: true, // Giữ lại timestamps
  }
);

// --- Các hàm và pre-hook giữ nguyên ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    throw new Error("Password not set for user");
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  // Chỉ hash nếu password thực sự được cung cấp (tránh lỗi khi cập nhật profile mà không đổi pass)
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next(); // Luôn gọi next()
});
// --- KẾT THÚC ---

const User = mongoose.model("User", userSchema);

export default User;
