import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Form.css"; // Dùng chung CSS với form Login/Register

const AdminCreateProduct = () => {
  // State cho các trường của form
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");

  // State cho UI
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Lấy thông tin user (để lấy token và kiểm tra admin)
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || null;

  useEffect(() => {
    // Bảo vệ trang này: Nếu chưa đăng nhập, hoặc đăng nhập nhưng KHÔNG phải admin
    if (!userInfo || !userInfo.isAdmin) {
      navigate("/login"); // Đá về trang đăng nhập
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Cấu hình Header, đính kèm Token của Admin
      // Đây là bước quan trọng để vượt qua middleware 'protect' và 'admin'
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Gọi API POST /api/products (đã được bảo vệ ở backend)
      await axios.post(
        "http://localhost:5000/api/products",
        { name, price, image, brand, category, countInStock, description },
        config
      );

      setLoading(false);
      alert("Tạo sản phẩm thành công!"); // Sẽ thay bằng thông báo đẹp hơn sau
      navigate("/"); // Chuyển về trang chủ sau khi tạo
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Tạo sản phẩm thất bại");
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h1>Tạo Sản Phẩm Mới</h1>
        {error && <div className="form-error">{error}</div>}

        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label>Tên Sản Phẩm</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>
          <div className="form-group">
            <label>Giá</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Nhập giá"
              required
            />
          </div>
          <div className="form-group">
            <label>Link Hình Ảnh</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Nhập URL hình ảnh (vd: /images/sample.jpg)"
            />
          </div>
          <div className="form-group">
            <label>Thương Hiệu</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Nhập thương hiệu"
            />
          </div>
          <div className="form-group">
            <label>Danh Mục</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Nhập danh mục"
            />
          </div>
          <div className="form-group">
            <label>Số Lượng Tồn Kho</label>
            <input
              type="number"
              value={countInStock}
              onChange={(e) => setCountInStock(e.target.value)}
              placeholder="Nhập số lượng"
            />
          </div>
          <div className="form-group">
            <label>Mô Tả</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả sản phẩm"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "1rem",
              }}
            ></textarea>
          </div>

          <button type="submit" className="form-btn" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo Sản Phẩm"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateProduct;
