import jwt from "jsonwebtoken";

// Hàm này sẽ tạo một token JWT mới dựa trên ID của người dùng
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token sẽ hết hạn sau 30 ngày
  });
};

export default generateToken;
