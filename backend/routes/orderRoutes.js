import express from "express";
const router = express.Router();
import {
  addOrderItems,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  createVnpayUrl,
  getOrderStats,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router
  .route("/")
  .post(protect, addOrderItems)
  .get(protect, admin, getAllOrders);
router.route("/myorders").get(protect, getMyOrders);
router.route("/:id/status").put(protect, admin, updateOrderStatus);
router
  .route("/")
  .post(protect, addOrderItems)
  .get(protect, admin, getAllOrders);

router.route("/myorders").get(protect, getMyOrders);

router.route("/stats").get(protect, admin, getOrderStats);

router.route("/:id/status").put(protect, admin, updateOrderStatus);

// Route tạo URL thanh toán VNPay
router.route("/create_payment_url").post(protect, createVnpayUrl);
router.route("/:id/cancel").put(protect, cancelOrder);

export default router;
