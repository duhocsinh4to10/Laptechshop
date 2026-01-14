import express from "express";
const router = express.Router();
import { chatWithAI } from "../controllers/chatController.js";

// Định nghĩa route cho chat
// Khi Frontend gửi yêu cầu POST đến /api/chat, hàm chatWithAI sẽ được gọi
router.post("/", chatWithAI);

export default router;
