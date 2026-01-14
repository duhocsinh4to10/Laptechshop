import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAdmin } from "../App";
import "./AdminProductForm.css"; // File CSS mới

const AdminCreateProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");
  // Thêm trạng thái hiển thị (isPublished / isActive)
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { adminInfo } = useAdmin();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };

      await axios.post(
        "http://localhost:5000/api/products",
        {
          name,
          price,
          image,
          brand,
          category,
          countInStock,
          description,
          // Gửi thêm trường này nếu backend hỗ trợ (cần sửa backend model nếu chưa có)
          isPublished,
        },
        config
      );

      setLoading(false);
      alert("Thêm sản phẩm thành công!");
      navigate("/products");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="admin-form-container">
      <Link to="/products" className="btn-back">
        &larr; Quay lại danh sách
      </Link>

      <div className="form-box">
        <h1>Thêm Sản Phẩm Mới</h1>
        {error && <div className="message-error">{error}</div>}

        <form onSubmit={submitHandler}>
          {/* Tên sản phẩm */}
          <div className="form-group">
            <label>Tên sản phẩm</label>
            <input
              type="text"
              placeholder="Nhập tên sản phẩm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Giá & Tồn kho */}
          <div className="form-row">
            <div className="form-group">
              <label>Giá (VNĐ)</label>
              <input
                type="number"
                placeholder="Nhập giá"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Số lượng tồn kho</label>
              <input
                type="number"
                placeholder="Nhập số lượng"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                required
                min="0"
              />
            </div>
          </div>

          {/* Hình ảnh */}
          <div className="form-group">
            <label>Hình ảnh (URL)</label>
            <input
              type="text"
              placeholder="Nhập đường dẫn ảnh"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
            {image && <img src={image} alt="Preview" className="img-preview" />}
          </div>

          {/* Hãng & Danh mục */}
          <div className="form-row">
            <div className="form-group">
              <label>Thương hiệu (Hãng)</label>
              <input
                type="text"
                placeholder="Ví dụ: Dell, HP"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <input
                type="text"
                placeholder="Ví dụ: Laptop, Phone"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Mô tả */}
          <div className="form-group">
            <label>Mô tả sản phẩm</label>
            <textarea
              rows="5"
              placeholder="Nhập mô tả chi tiết..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Trạng thái hiển thị (Toggle Switch) */}
          <div className="form-group checkbox-group">
            <label className="switch">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <span className="switch-label">
              {isPublished ? "Đang hiển thị trên web" : "Đang ẩn"}
            </span>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Tạo Sản Phẩm"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateProduct;
