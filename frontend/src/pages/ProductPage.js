import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../App.js"; // Import hook useCart
import { useUser } from "../App.js"; // Import hook useUser
import Rating from "../components/Rating.js"; // <-- 1. IMPORT RATING TỪ FILE MỚI
import "./ProductPage.css"; // CSS riêng

// --- 2. XÓA BỎ ĐỊNH NGHĨA RATING CŨ Ở ĐÂY ---
// const Rating = ({ value, text }) => { ... } // <-- ĐÃ XÓA

const ProductPage = () => {
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1); // Số lượng

  // --- State cho việc viết review (giữ nguyên) ---
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loadingReview, setLoadingReview] = useState(false);
  const [errorReview, setErrorReview] = useState("");
  const [successReview, setSuccessReview] = useState(false);
  // --- (Giữ nguyên) ---

  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { userInfo } = useUser();

  // --- useEffect (Giữ nguyên) ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(
          `http://localhost:5000/api/products/${productId}`
        );
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError("Không tìm thấy sản phẩm");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, successReview]);
  // --- (Giữ nguyên) ---

  // --- addToCartHandler (Giữ nguyên) ---
  const addToCartHandler = () => {
    addToCart(product, Number(qty));
    alert("Đã thêm vào giỏ hàng!");
    navigate("/cart");
  };

  // --- reviewSubmitHandler (Giữ nguyên) ---
  const reviewSubmitHandler = async (e) => {
    e.preventDefault();
    setLoadingReview(true);
    setErrorReview("");
    setSuccessReview(false);

    try {
      // Cần token của user
      if (!userInfo || !userInfo.token) {
        setErrorReview("Vui lòng đăng nhập để đánh giá.");
        setLoadingReview(false);
        return;
      }
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(
        `http://localhost:5000/api/products/${productId}/reviews`,
        { rating, comment },
        config
      );
      setLoadingReview(false);
      setSuccessReview(true); // Đặt cờ để useEffect chạy lại
      setRating(0);
      setComment("");
      alert("Đánh giá đã được gửi thành công!");
    } catch (err) {
      setLoadingReview(false);
      setErrorReview(err.response?.data?.message || "Gửi đánh giá thất bại.");
    }
  };
  // --- (Giữ nguyên) ---

  if (loading) return <p>Đang tải sản phẩm...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // --- Logic kiểm tra alreadyReviewed (Giữ nguyên) ---
  const alreadyReviewed = userInfo
    ? product.reviews?.find(
        (r) => r.user.toString() === userInfo._id.toString()
      )
    : false;

  return (
    <div className="product-page-container">
      <Link to="/" className="back-btn">
        &larr; Quay lại
      </Link>
      {/* --- Layout (Giữ nguyên) --- */}
      <div className="product-details-grid">
        {/* Cột 1: Ảnh */}
        <div className="product-image-container">
          <img src={product.image} alt={product.name} />
        </div>
        {/* Cột 2: Thông tin */}
        <div className="product-info-container">
          <h1>{product.name}</h1>
          {/* Component Rating bây giờ được import từ bên ngoài */}
          <Rating
            value={product.rating}
            text={`(${product.numReviews} đánh giá)`}
          />
          <p className="product-price-large">
            {product.price?.toLocaleString("vi-VN")} ₫
          </p>
          <p className="product-status">
            Trạng thái: {product.countInStock > 0 ? "Còn hàng" : "Hết hàng"}
          </p>
          <p className="product-sold">Đã bán: {product.sold || 0}</p>
          <p className="product-description">{product.description}</p>
        </div>
        {/* Cột 3: Hộp Mua Hàng (Giữ nguyên) */}
        <div className="product-action-container">
          <div className="action-box">
            <div className="action-row">
              <span>Giá:</span>
              <strong>{product.price?.toLocaleString("vi-VN")} ₫</strong>
            </div>
            <div className="action-row">
              <span>Trạng thái:</span>
              {product.countInStock > 0 ? "Còn hàng" : "Hết hàng"}
            </div>
            {product.countInStock > 0 && (
              <div className="action-row">
                <label htmlFor="qty">Số lượng:</label>
                <select
                  id="qty"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                >
                  {[...Array(Math.min(product.countInStock, 10)).keys()].map(
                    (x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
            <button
              className="add-to-cart-btn"
              onClick={addToCartHandler}
              disabled={product.countInStock === 0}
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>

      {/* --- Phần Review (Giữ nguyên) --- */}
      <div className="product-reviews-container">
        {/* Cột Trái: Danh sách Reviews */}
        <div className="review-list-section">
          <h2>Đánh Giá Của Khách Hàng</h2>
          {product.reviews && product.reviews.length === 0 && (
            <div className="review-message">Chưa có đánh giá nào.</div>
          )}
          <div className="review-list">
            {product.reviews &&
              product.reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <strong>{review.name}</strong>
                  <Rating value={review.rating} text="" />
                  <p className="review-date">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                  <p>{review.comment}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Cột Phải: Form Viết Review */}
        <div className="review-form-section">
          <h2>Viết Đánh Giá Của Bạn</h2>
          {errorReview && <div className="form-error">{errorReview}</div>}
          {userInfo ? (
            alreadyReviewed ? (
              <div className="review-message">
                Bạn đã đánh giá sản phẩm này.
              </div>
            ) : (
              <form onSubmit={reviewSubmitHandler}>
                <div className="form-group">
                  <label>Đánh giá (Số sao)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    required
                    className="review-select"
                  >
                    <option value="">-- Chọn số sao --</option>
                    <option value="1">1 - Rất Tệ</option>
                    <option value="2">2 - Tệ</option>
                    <option value="3">3 - Tốt</option>
                    <option value="4">4 - Rất Tốt</option>
                    <option value="5">5 - Tuyệt Vời</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nội dung (Văn bản)</label>
                  <textarea
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Viết đánh giá của bạn..."
                    className="review-textarea"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="form-btn"
                  disabled={loadingReview}
                >
                  {loadingReview ? "Đang gửi..." : "Gửi Đánh Giá"}
                </button>
              </form>
            )
          ) : (
            <div className="review-message">
              Vui lòng{" "}
              <Link to={`/login?redirect=/product/${productId}`}>
                Đăng nhập
              </Link>{" "}
              để viết đánh giá.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
