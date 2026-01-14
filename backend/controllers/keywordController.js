import Keyword from "../models/Keyword.model.js";

// @desc    Lấy tất cả từ khóa
// @route   GET /api/keywords
// @access  Public
const getKeywords = async (req, res) => {
  try {
    const keywords = await Keyword.find({}).sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.json(keywords);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// @desc    Thêm từ khóa mới
// @route   POST /api/keywords
// @access  Private/Admin
const addKeyword = async (req, res) => {
  const { text } = req.body;
  try {
    const keywordExists = await Keyword.findOne({ text });
    if (keywordExists) {
      return res.status(400).json({ message: "Từ khóa đã tồn tại" });
    }
    const keyword = await Keyword.create({ text });
    res.status(201).json(keyword);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm từ khóa" });
  }
};

// @desc    Xóa từ khóa
// @route   DELETE /api/keywords/:id
// @access  Private/Admin
const deleteKeyword = async (req, res) => {
  try {
    const keyword = await Keyword.findById(req.params.id);
    if (keyword) {
      await keyword.deleteOne();
      res.json({ message: "Đã xóa từ khóa" });
    } else {
      res.status(404).json({ message: "Không tìm thấy" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa" });
  }
};

export { getKeywords, addKeyword, deleteKeyword };
