import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./Form.css"; // Dùng chung CSS

const AdminProductEditPage = () => {
  // Lấy ID sản phẩm cần sửa từ URL
  const { id: productId } = useParams();

  // State để lưu thông tin sản phẩm
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true); // Loading để fetch data ban đầu
  const [updateLoading, setUpdateLoading] = useState(false); // Loading khi nhấn Cập nhật
  const [error, setError] = useState("");
  const [updateError, setUpdateError] = useState("");

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || null;

  useEffect(() => {
    // Bảo vệ trang
    if (!userInfo || !userInfo.isAdmin) {
      navigate("/login");
      return; // Dừng sớm nếu không phải admin
    }

    // Hàm fetch dữ liệu sản phẩm hiện tại
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(
          `http://localhost:5000/api/products/${productId}`
        );
        // Điền dữ liệu vào form
        setName(data.name);
        setPrice(data.price);
        setImage(data.image);
        setBrand(data.brand);
        setCategory(data.category);
        setCountInStock(data.countInStock);
        setDescription(data.description);
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [userInfo, navigate, productId]); // Phụ thuộc vào productId

  // Hàm xử lý khi nhấn nút "Cập Nhật"
  const submitHandler = async (e) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateLoading(true);

    try {
      // Cấu hình Header với Token
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Gọi API PUT /api/products/:id (Backend Bước 2)
      await axios.put(
        `http://localhost:5000/api/products/${productId}`,
        {
          _id: productId, // Gửi cả ID để backend tiện xử lý (tùy chọn)
          name,
          price,
          image,
          brand,
          category,
          countInStock,
          description,
        },
        config
      );

      setUpdateLoading(false);
      alert("Cập nhật sản phẩm thành công!");
      navigate("/admin/productlist"); // Quay về trang danh sách sản phẩm
    } catch (err) {
      setUpdateLoading(false);
      setUpdateError(
        err.response?.data?.message || "Cập nhật sản phẩm thất bại"
      );
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <Link
          to="/admin/productlist"
          className="back-btn"
          style={{ marginBottom: "1.5rem" }}
        >
          &larr; Quay lại Danh Sách
        </Link>
        <h1>Sửa Sản Phẩm</h1>

        {/* Hiển thị lỗi fetch hoặc lỗi update */}
        {error && <div className="form-error">{error}</div>}
        {updateError && <div className="form-error">{updateError}</div>}

        {/* Hiển thị form khi không loading, ngược lại hiển thị loading */}
        {loading ? (
          <p>Đang tải thông tin sản phẩm...</p>
        ) : (
          <form onSubmit={submitHandler}>
            {/* Các trường input giống hệt trang Tạo Sản Phẩm */}
            {/* Chỉ khác là value={name}, value={price}... đã có sẵn */}
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
                placeholder="Nhập URL hình ảnh"
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

            <button type="submit" className="form-btn" disabled={updateLoading}>
              {updateLoading ? "Đang cập nhật..." : "Cập Nhật Sản Phẩm"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminProductEditPage;
