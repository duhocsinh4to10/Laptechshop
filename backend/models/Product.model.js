import mongoose from "mongoose";

// --- 1. TẠO MỚI: REVIEW SCHEMA ---
// Đây là một "sub-document" (tài liệu con)
// Nó định nghĩa cấu trúc của MỘT đánh giá
const reviewSchema = new mongoose.Schema(
  {
    user: {
      // Người dùng đã viết đánh giá
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      // Tên của người dùng (lưu lại phòng khi user đổi tên)
      type: String,
      required: true,
    },
    rating: {
      // Số sao (1-5)
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      // Nội dung văn bản
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Ghi lại thời gian đánh giá được tạo
  }
);
// --- KẾT THÚC REVIEW SCHEMA ---

// --- 2. SỬA: PRODUCT SCHEMA ---
const productSchema = new mongoose.Schema(
  {
    user: {
      // Người bán (admin)
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: { type: String, required: true },
    image: { type: String, required: true, default: "/images/sample.jpg" },
    description: {
      type: String,
      required: true,
      default: "Sample description",
    },
    brand: { type: String, required: true, default: "Sample brand" },
    category: { type: String, required: true, default: "Sample category" },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },

    // --- 3. THÊM CÁC TRƯỜNG MỚI (Đánh giá & Bán ra) ---
    reviews: [reviewSchema], // Một mảng chứa tất cả các đánh giá (dùng schema ở trên)

    rating: {
      // Điểm sao trung bình (tính toán từ 'reviews')
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      // Tổng số lượng đánh giá
      type: Number,
      required: true,
      default: 0,
    },
    sold: {
      // Số lượng đã bán
      type: Number,
      required: true,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: true, // Mặc định là hiển thị
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
