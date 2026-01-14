import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import keywordRoutes from "./routes/keywordRoutes.js"; // <-- 1. IMPORT ORDER ROUTES MỚI
import adRoutes from "./routes/adRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
app.use("/api/ads", adRoutes);
// Chạy config dotenv đầu tiên
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });
console.log("MONGO_URI from env:", process.env.MONGO_URI);

// Kết nối MongoDB
const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb+srv://laptechshop:Datnguyen04@cluster0.t0gyywh.mongodb.net/?appName=Cluster0";
    console.log("Using MONGO_URI:", mongoUri);
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// Khởi tạo app

// Sử dụng middleware
app.use(cors());
app.use(express.json()); // Để phân tích body JSON

// Định tuyến API
app.use("/api/products", productRoutes);
app.use("/api/users", authRoutes); // Cho login/register/verify
app.use("/api/users", userRoutes); // Cho profile
app.use("/api/chat", chatRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/keywords", keywordRoutes);

// Route gốc
app.get("/", (req, res) => {
  res.send("API LapTechShop is running...");
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(`Backend server running on http://localhost:${PORT}`)
);
