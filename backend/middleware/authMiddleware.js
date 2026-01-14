import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// Middleware 1: Kiểm tra Đăng nhập (bằng Token)
const protect = async (req, res, next) => {
  let token;

  // Đọc JWT từ header 'Authorization' (dạng 'Bearer <token>')
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Lấy token (phần sau chữ 'Bearer ')
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token để lấy user id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy thông tin user từ ID (trừ mật khẩu) và gắn vào req
      // 'req.user' này sẽ được dùng ở các bước sau
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Cho phép đi tiếp
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Token không hợp lệ" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Chưa đăng nhập, không có token" });
  }
};

// Middleware 2: Kiểm tra Admin
const admin = (req, res, next) => {
  // 'req.user' là từ middleware 'protect' chạy trước
  if (req.user && req.user.isAdmin) {
    next(); // Là admin, cho đi tiếp
  } else {
    // 403 Forbidden - Bị cấm
    res.status(403).json({ message: "Không có quyền Admin" });
  }
};

export { protect, admin };
