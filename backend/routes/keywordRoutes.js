import express from "express";
const router = express.Router();
import {
  getKeywords,
  addKeyword,
  deleteKeyword,
} from "../controllers/keywordController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router.route("/").get(getKeywords).post(protect, admin, addKeyword);

router.route("/:id").delete(protect, admin, deleteKeyword);

export default router;
