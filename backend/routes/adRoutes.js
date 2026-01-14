import express from "express";
const router = express.Router();
import {
  getAds,
  getAllAds,
  saveAd,
  deleteAd,
  updateAd,
} from "../controllers/adController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

// Public: Lấy ads hiển thị
router.get("/", getAds);

// Admin: Quản lý
router.get("/admin", protect, admin, getAllAds);
router.post("/", protect, admin, saveAd);
router.put("/:id", protect, admin, updateAd);
router.delete("/:id", protect, admin, deleteAd);

export default router;
