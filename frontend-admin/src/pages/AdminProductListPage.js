import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdmin } from "../App";
import "./AdminListPage.css"; // File CSS chung

const AdminProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { adminInfo } = useAdmin();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const config = {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
      };

      // --- QUAN TRỌNG: Gọi API dành riêng cho Admin ---
      const { data } = await axios.get(
        "http://localhost:5000/api/products/admin",
        config
      );
      setProducts(data);
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [adminInfo]);

  useEffect(() => {
    if (adminInfo && adminInfo.isAdmin) {
      fetchProducts();
    } else {
      navigate("/login");
    }
  }, [adminInfo, navigate, fetchProducts]);

  const deleteHandler = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${adminInfo.token}` },
        };
        await axios.delete(`http://localhost:5000/api/products/${id}`, config);
        alert("Đã xóa sản phẩm thành công!");
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || "Xóa sản phẩm thất bại");
      }
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>Đang tải...</div>
    );
  if (error) return <div className="form-error">{error}</div>;

  return (
    <div className="admin-list-container">
      <div className="admin-list-header">
        <h1>Quản Lý Sản Phẩm</h1>
        <Link to="/product/create" className="admin-add-btn">
          + Thêm Sản Phẩm
        </Link>
      </div>

      <table className="admin-list-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>TÊN</th>
            <th>GIÁ</th>
            <th>TRẠNG THÁI</th> {/* Cột hiển thị Ẩn/Hiện */}
            <th>THƯƠNG HIỆU</th>
            <th>HÀNH ĐỘNG</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>...{product._id.substring(product._id.length - 6)}</td>
              <td>{product.name}</td>
              <td>{product.price.toLocaleString("vi-VN")} ₫</td>

              {/* Hiển thị trạng thái */}
              <td style={{ fontWeight: "bold" }}>
                {product.isPublished ? (
                  <span style={{ color: "green" }}>Hiện</span>
                ) : (
                  <span style={{ color: "red" }}>Ẩn</span>
                )}
              </td>

              <td>{product.brand}</td>
              <td>
                <Link
                  to={`/product/${product._id}/edit`}
                  className="admin-edit-btn"
                >
                  Sửa
                </Link>
                <button
                  type="button"
                  className="admin-delete-btn"
                  onClick={() => deleteHandler(product._id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductListPage;
