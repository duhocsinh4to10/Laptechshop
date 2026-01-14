import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminListPage.css";

const AdminProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const navigate = useNavigate();
  // Không cần lấy userInfo ở đây nữa

  // --- HÀM FETCH GIỮ NGUYÊN ---
  const fetchProducts = async () => {
    // Lấy userInfo ở đây để đảm bảo có token mới nhất
    const currentUserInfo =
      JSON.parse(localStorage.getItem("userInfo")) || null;
    if (!currentUserInfo || !currentUserInfo.token) {
      setError("Không tìm thấy thông tin đăng nhập.");
      setLoading(false);
      return; // Dừng nếu không có token
    }
    const config = {
      headers: {
        Authorization: `Bearer ${currentUserInfo.token}`, // Cần token để gọi API products (nếu API này được bảo vệ)
      },
    };

    try {
      setLoading(true);
      setError("");
      // Có thể cần config nếu API /products cần token
      const { data } = await axios.get(
        "http://localhost:5000/api/products",
        config
      );
      setProducts(data);
    } catch (err) {
      setError("Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  // --- SỬA USEEFFECT ---
  useEffect(() => {
    // Đọc userInfo bên trong useEffect
    const currentUserInfo =
      JSON.parse(localStorage.getItem("userInfo")) || null;

    // Bảo vệ trang: Chỉ Admin mới được vào
    if (!currentUserInfo || !currentUserInfo.isAdmin) {
      navigate("/login");
    } else {
      fetchProducts(); // Lấy danh sách sản phẩm khi component mount
    }
    // Chỉ phụ thuộc vào navigate (ổn định)
  }, [navigate]);
  // --- KẾT THÚC SỬA ---

  // --- SỬA DELETE HANDLER (Lấy userInfo bên trong) ---
  const deleteHandler = async (id) => {
    // Đọc userInfo bên trong hàm
    const currentUserInfo =
      JSON.parse(localStorage.getItem("userInfo")) || null;
    if (!currentUserInfo || !currentUserInfo.token) {
      setDeleteError("Không thể xác thực để xóa.");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      setDeleteError("");
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${currentUserInfo.token}`, // Dùng token mới nhất
          },
        };
        await axios.delete(`http://localhost:5000/api/products/${id}`, config);
        fetchProducts(); // Tải lại danh sách
        alert("Đã xóa sản phẩm thành công!");
      } catch (err) {
        setDeleteError(err.response?.data?.message || "Xóa sản phẩm thất bại");
      }
    }
  };
  // --- KẾT THÚC SỬA ---

  if (loading) return <p>Đang tải danh sách sản phẩm...</p>;

  // --- PHẦN JSX GIỮ NGUYÊN ---
  return (
    <div className="admin-list-container">
      <div className="admin-list-header">
        <h1>Quản Lý Sản Phẩm</h1>
        <Link to="/admin/product/create" className="admin-add-btn">
          + Thêm Sản Phẩm
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}
      {deleteError && <div className="form-error">{deleteError}</div>}

      <table className="admin-list-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>TÊN</th>
            <th>GIÁ</th>
            <th>DANH MỤC</th>
            <th>THƯƠNG HIỆU</th>
            <th>HÀNH ĐỘNG</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product._id}>
                <td>{product._id}</td>
                <td>{product.name}</td>
                <td>{product.price.toLocaleString("vi-VN")} ₫</td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  <Link
                    to={`/admin/product/${product._id}/edit`}
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
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Chưa có sản phẩm nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductListPage;
