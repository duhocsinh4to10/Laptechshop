import Ad from "../models/Ad.model.js";

// @desc    Lấy danh sách quảng cáo đang hoạt động (cho User)
// @route   GET /api/ads
// @access  Public
const getAds = async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// @desc    Lấy tất cả quảng cáo (cho Admin)
// @route   GET /api/ads/admin
// @access  Private/Admin
const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find({});
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// @desc    Thêm/Cập nhật quảng cáo
// @route   POST /api/ads
// @access  Private/Admin
const saveAd = async (req, res) => {
  const { image, link, position, isActive } = req.body;

  try {
    // Kiểm tra xem đã có quảng cáo ở vị trí này chưa
    // (Mỗi bên chỉ nên có 1 quảng cáo chính, hoặc bạn có thể cho phép nhiều)
    // Ở đây mình làm đơn giản: Nếu có rồi thì update, chưa có thì tạo mới
    // Hoặc bạn có thể cho phép tạo nhiều và Admin tự tắt/bật.
    // Ở đây ta sẽ tạo mới.

    const ad = await Ad.create({
      image,
      link,
      position,
      isActive,
    });

    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lưu quảng cáo" });
  }
};

// @desc    Xóa quảng cáo
// @route   DELETE /api/ads/:id
// @access  Private/Admin
const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (ad) {
      await ad.deleteOne();
      res.json({ message: "Đã xóa quảng cáo" });
    } else {
      res.status(404).json({ message: "Không tìm thấy" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa" });
  }
};

// @desc    Cập nhật trạng thái
// @route   PUT /api/ads/:id
const updateAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (ad) {
      ad.image = req.body.image || ad.image;
      ad.link = req.body.link || ad.link;
      ad.isActive =
        req.body.isActive !== undefined ? req.body.isActive : ad.isActive;
      ad.position = req.body.position || ad.position;

      const updatedAd = await ad.save();
      res.json(updatedAd);
    } else {
      res.status(404).json({ message: "Không tìm thấy" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật" });
  }
};

export { getAds, getAllAds, saveAd, deleteAd, updateAd };
