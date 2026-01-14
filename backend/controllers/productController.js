import Product from "../models/Product.model.js";
import User from "../models/User.model.js";

// @desc   Lấy tất cả sản phẩm HOẶC lọc theo keyword/category/brand/filterType
// @route  GET /api/products
// @access Public
const getProducts = async (req, res) => {
  try {
    // 1. Lấy các tham số lọc từ URL
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};

    const category =
      req.query.category && req.query.category !== "All"
        ? { category: req.query.category }
        : {};

    // Lọc theo Brand (Hãng) - Dùng regex để không phân biệt hoa thường
    const brand =
      req.query.brand && req.query.brand !== "All"
        ? { brand: { $regex: req.query.brand, $options: "i" } }
        : {};

    // Lọc sản phẩm hiển thị (User chỉ thấy isPublished=true)
    const publishedFilter = { isPublished: true };

    const filterType = req.query.filterType || "trend";

    // --- XỬ LÝ LỌC GIÁ ---
    let priceFilter = {};
    const priceRange = req.query.priceRange;

    if (priceRange && priceRange !== "all") {
      switch (priceRange) {
        case "under1":
          priceFilter = { price: { $lt: 1000000 } };
          break;
        case "1to5":
          priceFilter = { price: { $gte: 1000000, $lte: 5000000 } };
          break;
        case "5to10":
          priceFilter = { price: { $gte: 5000000, $lte: 10000000 } };
          break;
        case "10to15":
          priceFilter = { price: { $gte: 10000000, $lte: 15000000 } };
          break;
        case "above15":
          priceFilter = { price: { $gt: 15000000 } };
          break;
        default:
          priceFilter = {};
      }
    }
    // ---------------------

    // 2. Kết hợp các bộ lọc
    let filter = {
      ...keyword,
      ...category,
      ...brand,
      ...priceFilter,
      ...publishedFilter,
    };

    // 3. Áp dụng bộ lọc nâng cao (View Type)
    switch (filterType) {
      case "work":
        filter = {
          ...filter,
          $or: [{ category: "Workstation" }, { category: "Laptop" }],
        };
        break;
      case "home":
        filter = {
          ...filter,
          $or: [{ category: "Desktop" }, { category: "Monitor" }],
        };
        break;
      case "gaming":
        filter = {
          ...filter,
          name: { ...filter.name, $regex: "Gaming", $options: "i" },
        };
        break;
      case "trend":
      case "suggested":
      default:
        break;
    }

    // 4. Tạo query
    let productsQuery = Product.find(filter);

    // 5. Sắp xếp kết quả
    if (filterType === "suggested") {
      productsQuery = productsQuery.sort({ rating: -1 }); // Đánh giá cao nhất
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 }); // Mới nhất
    }

    // 6. Giới hạn kết quả
    // Nếu có tham số limit, dùng nó. Nếu không, mặc định 12.
    const limit = req.query.limit ? parseInt(req.query.limit) : 12;
    const products = await productsQuery.limit(limit);

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Lấy 1 sản phẩm bằng ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    res
      .status(404)
      .json({ message: "Không tìm thấy sản phẩm (ID không hợp lệ)" });
  }
};

// @desc    Tạo sản phẩm (Admin)
// @route   POST /api/products
const createProduct = async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
    sold,
    isPublished,
  } = req.body;
  try {
    const product = new Product({
      name: name || "Sample name",
      price: price || 0,
      user: req.user._id,
      image: image || "/images/sample.jpg",
      brand: brand || "Sample brand",
      category: category || "Sample category",
      countInStock: countInStock || 0,
      numReviews: 0,
      description: description || "Sample description",
      sold: sold || 0,
      isPublished: isPublished !== undefined ? isPublished : true,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Tạo sản phẩm thất bại" });
  }
};

// @desc    Cập nhật sản phẩm (Admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
    sold,
    isPublished,
  } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.price = price === undefined ? product.price : price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.countInStock =
        countInStock === undefined ? product.countInStock : countInStock;
      product.sold = sold === undefined ? product.sold : sold;

      if (isPublished !== undefined) {
        product.isPublished = isPublished;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Cập nhật sản phẩm thất bại" });
  }
};

// @desc    Xóa sản phẩm (Admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: "Sản phẩm đã được xóa" });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Xóa sản phẩm thất bại" });
  }
};

// @desc    Tạo đánh giá (Review)
// @route   POST /api/products/:id/reviews
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const { id: productId } = req.params;
  if (!rating || !comment) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp cả số sao và nội dung đánh giá." });
  }
  try {
    const product = await Product.findById(productId);
    if (!req.user)
      return res.status(401).json({ message: "Cần đăng nhập để đánh giá" });

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        return res
          .status(400)
          .json({ message: "Bạn đã đánh giá sản phẩm này rồi." });
      }

      const review = {
        user: req.user._id,
        name: user.name,
        rating: Number(rating),
        comment: comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Đánh giá đã được thêm thành công." });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }
  } catch (error) {
    console.error("Lỗi khi tạo đánh giá:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi thêm đánh giá." });
  }
};

// @desc    Lấy tất cả sản phẩm cho Admin (bao gồm cả ẩn)
// @route   GET /api/products/admin
const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error("Error fetching admin products:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// --- HÀM MỚI: Gợi ý tìm kiếm (Live Search) ---
// @desc    Lấy gợi ý sản phẩm theo từ khóa
// @route   GET /api/products/suggestions
// @access  Public
const getProductSuggestions = async (req, res) => {
  try {
    const keyword = req.query.keyword;

    if (!keyword || keyword.trim() === "") {
      return res.json([]);
    }

    const suggestions = await Product.find({
      name: { $regex: keyword, $options: "i" },
      isPublished: true,
    })
      .select("_id name image price")
      .limit(6);

    res.json(suggestions);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
// --- KẾT THÚC HÀM MỚI ---

// Export tất cả các hàm (bao gồm getProductSuggestions)
export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getAdminProducts,
  getProductSuggestions, // <-- ĐÃ THÊM EXPORT NÀY
};
