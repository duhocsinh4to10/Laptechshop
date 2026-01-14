import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAdmin } from "../App";
import "./AdminProductForm.css"; // Dùng chung CSS

const AdminProductEditPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { adminInfo } = useAdmin();

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!adminInfo) {
      navigate("/login");
      return;
    }

    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/products/${productId}`
        );
        setName(data.name);
        setPrice(data.price);
        setImage(data.image);
        setBrand(data.brand);
        setCategory(data.category);
        setCountInStock(data.countInStock);
        setDescription(data.description);
        // Kiểm tra xem backend có trả về isPublished không, nếu không mặc định là true
        setIsPublished(
          data.isPublished !== undefined ? data.isPublished : true
        );

        setLoading(false);
      } catch (err) {
        setError("Không tìm thấy sản phẩm");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, adminInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminInfo.token}`,
        },
      };

      await axios.put(
        `http://localhost:5000/api/products/${productId}`,
        {
          name,
          price,
          image,
          brand,
          category,
          countInStock,
          description,
          isPublished,
        },
        config
      );

      setUpdateLoading(false);
      alert("Cập nhật thành công!");
      navigate("/products");
    } catch (err) {
      setUpdateLoading(false);
      alert(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  if (loading) return <div className="loading-text">Đang tải dữ liệu...</div>;
  if (error) return <div className="message-error">{error}</div>;

  return (
    <div className="admin-form-container">
      <Link to="/products" className="btn-back">
        &larr; Quay lại danh sách
      </Link>

      <div className="form-box">
        <div className="form-header">
          <h1>Sửa Sản Phẩm</h1>
          <span className="product-id-badge">ID: {productId}</span>
        </div>

        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label>Tên sản phẩm</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giá (VNĐ)</label>
              <input
                type="number"
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
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Hình ảnh (URL)</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
            {image && <img src={image} alt="Preview" className="img-preview" />}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Thương hiệu</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả sản phẩm</label>
            <textarea
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

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
              {isPublished
                ? "Đang hiển thị trên web"
                : "Đang ẩn (Khách không thấy)"}
            </span>
          </div>

          <button type="submit" className="btn-submit" disabled={updateLoading}>
            {updateLoading ? "Đang cập nhật..." : "Lưu Thay Đổi"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProductEditPage;
