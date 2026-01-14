import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./HomePage.css";
import { useSearch } from "../App.js";
import ProductCard from "../components/ProductCard.js"; // Import mới
import ProductBlock from "../components/ProductBlock.js"; // Import mới

const categories = [
  "All",
  "Laptop",
  "Desktop",
  "Workstation",
  "Tablet",
  "Phone",
  "Monitor",
];
const brandMap = {
  Laptop: ["All", "Dell", "HP", "Lenovo", "Apple", "Asus", "Acer"],
  Desktop: ["All", "Dell", "HP", "Lenovo", "Asus"],
  Workstation: ["All", "Dell", "HP", "Lenovo"],
  Tablet: ["All", "Apple", "Samsung", "Lenovo"],
  Phone: ["All", "Apple", "Samsung", "Xiaomi"],
  Monitor: ["All", "LG", "Samsung", "Dell", "Asus", "ViewSonic"],
};
const filterTypes = {
  trend: "Trend Now",
  suggested: "Suggested For You",
  work: "For Work",
  home: "For Home",
  gaming: "For Gaming",
};
const filterTypeKeys = Object.keys(filterTypes);

const priceRanges = [
  { label: "Tất cả giá", value: "all" },
  { label: "Dưới 1 triệu", value: "under1" },
  { label: "1 - 5 triệu", value: "1to5" },
  { label: "5 - 10 triệu", value: "5to10" },
  { label: "10 - 15 triệu", value: "10to15" },
  { label: "Trên 15 triệu", value: "above15" },
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedFilterType, setSelectedFilterType] = useState("trend");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");

  const [hoveredCategory, setHoveredCategory] = useState(null);
  const { keyword, setKeyword } = useSearch();
  const [hotKeywords, setHotKeywords] = useState([]);

  // Kiểm tra xem người dùng có đang ở chế độ xem "Mặc định" không
  // (Tức là chưa lọc gì cả, để hiển thị các Block)
  const isDefaultView =
    selectedCategory === "All" &&
    selectedBrand === "All" &&
    selectedPriceRange === "all" &&
    !keyword;

  useEffect(() => {
    const fetchHotKeywords = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/keywords");
        setHotKeywords(data);
      } catch (err) {
        console.error("Lỗi lấy từ khóa:", err);
      }
    };
    fetchHotKeywords();
  }, []);

  const fetchProducts = useCallback(
    async (category, filterType, brand, priceRange) => {
      try {
        setLoading(true);
        setError("");
        // Nếu là view mặc định, ta vẫn fetch data cho phần "Gợi ý cho bạn" ở dưới cùng
        // Limit 12 (hoặc nhiều hơn) cho lưới chính
        const { data } = await axios.get(
          `http://localhost:5000/api/products?keyword=${keyword}&category=${category}&filterType=${filterType}&brand=${brand}&priceRange=${priceRange}&limit=12`
        );
        setProducts(data);
      } catch (err) {
        setError("Không thể tải sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    },
    [keyword]
  );

  useEffect(() => {
    fetchProducts(
      selectedCategory,
      selectedFilterType,
      selectedBrand,
      selectedPriceRange
    );
  }, [
    selectedCategory,
    selectedFilterType,
    selectedBrand,
    selectedPriceRange,
    fetchProducts,
  ]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedBrand("All");
    setHoveredCategory(null);
  };
  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
    setHoveredCategory(null);
  };
  const handleFilterTypeClick = (filterType) => {
    setSelectedFilterType(filterType);
  };
  const handleHotKeywordClick = (text) => {
    setKeyword(text);
  };

  return (
    <>
      {/* Hot Keywords */}
      {hotKeywords.length > 0 && (
        <div className="hot-keywords-container">
          <span className="hot-key-label">Tìm kiếm nổi bật:</span>
          <div className="hot-keywords-list">
            {hotKeywords.map((k) => (
              <button
                key={k._id}
                className="hot-keyword-tag"
                onClick={() => handleHotKeywordClick(k.text)}
              >
                {k.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Bar */}
      <div
        className="category-bar-container"
        onMouseLeave={() => setHoveredCategory(null)}
      >
        <div className="category-bar">
          {categories.map((cat) => (
            <div
              key={cat}
              className="category-item-wrapper"
              onMouseEnter={() => setHoveredCategory(cat)}
            >
              <button
                className={`category-btn ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}{" "}
                {brandMap[cat] && (
                  <i className="fas fa-chevron-down category-arrow"></i>
                )}
              </button>
              {hoveredCategory === cat && brandMap[cat] && (
                <div className="brand-dropdown">
                  {brandMap[cat].map((brand) => (
                    <button
                      key={brand}
                      className={`brand-btn ${
                        selectedBrand === brand && selectedCategory === cat
                          ? "active"
                          : ""
                      }`}
                      onClick={() => handleBrandClick(brand)}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="price-filter-bar">
        {priceRanges.map((range) => (
          <button
            key={range.value}
            className={`price-filter-btn ${
              selectedPriceRange === range.value ? "active" : ""
            }`}
            onClick={() => setSelectedPriceRange(range.value)}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="filter-type-bar">
        {filterTypeKeys.map((key) => (
          <button
            key={key}
            className={`filter-type-btn ${
              selectedFilterType === key ? "active" : ""
            }`}
            onClick={() => handleFilterTypeClick(key)}
          >
            {filterTypes[key]}
          </button>
        ))}
      </div>

      {/* --- PHẦN HIỂN THỊ CHÍNH --- */}

      {/* 1. Nếu đang ở chế độ Mặc Định -> Hiển thị các PRODUCT BLOCKS */}
      {isDefaultView && (
        <div className="home-product-blocks">
          {/* Block: Điện thoại nổi bật */}
          <ProductBlock
            title="Điện thoại HOT"
            category="Phone"
            limit={4}
            filterType="trend"
          />

          {/* Block: Laptop Gaming */}
          <ProductBlock
            title="Laptop Gaming"
            category="Laptop"
            limit={4}
            filterType="gaming"
          />

          {/* Block: Màn hình giá tốt */}
          <ProductBlock
            title="Màn hình sắc nét"
            category="Monitor"
            limit={4}
            filterType="suggested"
          />
        </div>
      )}

      {/* 2. Lưới sản phẩm chính (Hiển thị kết quả lọc HOẶC "Gợi ý hôm nay") */}
      <div className="main-product-section">
        <h2 className="section-title">
          {isDefaultView ? "Gợi ý hôm nay" : "Kết quả tìm kiếm"}
        </h2>

        {loading ? (
          <p>Đang tải sản phẩm...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div className="product-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p>Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
