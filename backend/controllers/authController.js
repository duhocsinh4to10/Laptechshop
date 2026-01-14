import User from "../models/User.model.js";
import Otp from "../models/Otp.model.js";
import generateToken from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";
import { sendVerificationEmail } from "../utils/sendEmail.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_BACKEND);

// --- Đăng nhập/Đăng ký bằng Email & Mật khẩu ---

// @desc    Đăng nhập & lấy token
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // KIỂM TRA ĐÃ XÁC THỰC CHƯA
    // if (!user.isVerified) {
    //   // Nếu user tồn tại nhưng chưa xác thực, gửi lại OTP
    //   const otp = Math.floor(100000 + Math.random() * 900000).toString();
    //   await Otp.deleteMany({ email: email });
    //   await Otp.create({
    //     email,
    //     code: otp,
    //     expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    //   });
    //   await sendVerificationEmail(email, otp);

    //   return res.status(401).json({
    //     message: "Tài khoản chưa được xác thực. Mã OTP mới đã được gửi.",
    //     verificationRequired: true,
    //     email: email,
    //   });
    // }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// @desc    Đăng ký người dùng mới
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      if (!userExists.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.deleteMany({ email: email });
        await Otp.create({
          email,
          code: otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });
        await sendVerificationEmail(email, otp);

        return res.status(200).json({
          message:
            "Email đã tồn tại nhưng chưa xác thực. Mã OTP mới đã được gửi.",
          email: email,
        });
      }
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Tạo user mới (chưa xác thực)
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
    });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await Otp.create({
        email,
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      await sendVerificationEmail(email, otp);

      res.status(201).json({
        message: "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.",
        email: user.email,
      });
    } else {
      res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// --- HÀM MỚI: Xác thực OTP ---
const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpEntry = await Otp.findOne({ email, code: otp });

    if (!otpEntry) {
      return res.status(400).json({ message: "Mã OTP không hợp lệ" });
    }

    if (otpEntry.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpEntry._id });
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.isVerified = true;
    await user.save();
    await Otp.deleteOne({ _id: otpEntry._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// --- SỬA HÀM GOOGLE LOGIN ---
const loginWithGoogle = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID_BACKEND,
    });

    const payload = ticket.getPayload();
    const { email, name, email_verified } = payload;

    if (!email_verified) {
      return res
        .status(400)
        .json({ message: "Email Google chưa được xác thực" });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      const newUser = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-8),
        isAdmin: false,
        isVerified: true, // Google login tự động xác thực
      });
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        token: generateToken(newUser._id),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Token Google không hợp lệ" });
  }
};

// --- (Code SĐT/OTP ví dụ) ---
const sendOtp = async (req, res) => {
  /* ... */
};
const verifyOtpAndRegister = async (req, res) => {
  /* ... */
};

// --- EXPORT (Đã chứa verifyEmail) ---
export {
  loginUser,
  registerUser,
  verifyEmail,
  loginWithGoogle,
  sendOtp,
  verifyOtpAndRegister,
};
