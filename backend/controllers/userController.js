import User from "../models/User.model.js";
import generateToken from "../utils/generateToken.js"; // Cần để trả token mới nếu pass đổi

// @desc    Lấy thông tin profile của người dùng đang đăng nhập
// @route   GET /api/users/profile
// @access  Private (Cần đăng nhập)
const getUserProfile = async (req, res) => {
  // Middleware 'protect' đã lấy thông tin user và gắn vào req.user
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      phone: user.phone,
      gender: user.gender,
      address: user.address,
      idCardNumber: user.idCardNumber,
    });
  } else {
    res.status(404).json({ message: "Không tìm thấy người dùng" });
  }
};

// @desc    Cập nhật thông tin profile của người dùng đang đăng nhập
// @route   PUT /api/users/profile
// @access  Private (Cần đăng nhập)
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Cập nhật các trường thông tin cơ bản
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email; // Cẩn thận nếu email là duy nhất
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender || user.gender;
    user.idCardNumber = req.body.idCardNumber || user.idCardNumber;

    // Cập nhật địa chỉ (nếu có)
    if (req.body.address) {
      user.address = {
        street: req.body.address.street || user.address?.street,
        ward: req.body.address.ward || user.address?.ward,
        district: req.body.address.district || user.address?.district,
        province: req.body.address.province || user.address?.province,
      };
    }

    // Cập nhật mật khẩu (nếu người dùng cung cấp)
    if (req.body.password) {
      // Mongoose pre-save hook trong User.model.js sẽ tự động hash mật khẩu mới
      user.password = req.body.password;
    }

    try {
      const updatedUser = await user.save();
      // Trả về thông tin user đã cập nhật và token mới (quan trọng nếu đổi email/pass)
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isVerified: updatedUser.isVerified,
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        address: updatedUser.address,
        idCardNumber: updatedUser.idCardNumber,
        token: generateToken(updatedUser._id), // Tạo token mới
      });
    } catch (error) {
      // Xử lý lỗi validation (ví dụ: email/phone trùng)
      console.error("Error updating profile:", error);
      if (error.code === 11000) {
        // Lỗi duplicate key
        res
          .status(400)
          .json({ message: "Email hoặc số điện thoại đã tồn tại." });
      } else {
        res
          .status(400)
          .json({ message: "Cập nhật thất bại. Dữ liệu không hợp lệ." });
      }
    }
  } else {
    res.status(404).json({ message: "Không tìm thấy người dùng" });
  }
};

// Export các hàm controller mới
export { getUserProfile, updateUserProfile };
