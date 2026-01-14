import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: false,
      default: "/", // Mặc định về trang chủ nếu không có link
    },
    position: {
      type: String,
      required: true,
      enum: ["left", "right"], // Chỉ chấp nhận 'left' hoặc 'right'
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Ad = mongoose.model("Ad", adSchema);
export default Ad;
