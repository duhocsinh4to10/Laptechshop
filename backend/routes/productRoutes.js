import express from "express";
const router = express.Router();
import {
  getProducts,
  getAdminProducts, // <-- Import hàm mới
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductSuggestions // <-- Import hàm mới
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// Route Public: /api/products (Chỉ trả về isPublished=true)
router.route("/").get(getProducts).post(protect, admin, createProduct);

// Route Admin: /api/products/admin (Trả về TẤT CẢ)
// Quan trọng: Đặt route này TRƯỚC route /:id
router.route("/admin").get(protect, admin, getAdminProducts);

// Các route thao tác ID
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route("/:id/reviews").post(protect, createProductReview);
router.route('/suggestions').get(getProductSuggestions);

export default router;
