import express from "express";
const router = express.Router();
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js"; // Import controller profile
import { protect } from "../middleware/authMiddleware.js"; // Import middleware bảo vệ

// Định nghĩa route cho profile
// Cả hai route này đều yêu cầu người dùng phải đăng nhập (dùng middleware 'protect')
router
  .route("/profile")
  .get(protect, getUserProfile) // GET /api/users/profile -> Lấy profile
  .put(protect, updateUserProfile); // PUT /api/users/profile -> Cập nhật profile

export default router;
