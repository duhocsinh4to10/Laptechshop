import mongoose from "mongoose";

const keywordSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      unique: true, // Không trùng lặp
      trim: true,
    },
    // Có thể thêm 'count' nếu muốn đếm số lượt click sau này
  },
  { timestamps: true }
);

const Keyword = mongoose.model("Keyword", keywordSchema);
export default Keyword;
