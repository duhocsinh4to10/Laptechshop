import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAdmin } from "../App";
import "./AdminListPage.css"; // Dùng lại CSS chung

const AdminAdPage = () => {
  const [ads, setAds] = useState([]);
  const { adminInfo } = useAdmin();

  // State form
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [position, setPosition] = useState("left");

  const fetchAds = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
      };
      const { data } = await axios.get(
        "http://localhost:5000/api/ads/admin",
        config
      );
      setAds(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
      };
      await axios.post(
        "http://localhost:5000/api/ads",
        { image, link, position },
        config
      );
      setImage("");
      setLink("");
      fetchAds();
      alert("Thêm quảng cáo thành công");
    } catch (error) {
      alert("Lỗi khi thêm");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa quảng cáo này?")) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${adminInfo.token}` },
        };
        await axios.delete(`http://localhost:5000/api/ads/${id}`, config);
        fetchAds();
      } catch (error) {
        alert("Lỗi khi xóa");
      }
    }
  };

  const handleToggle = async (ad) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
      };
      await axios.put(
        `http://localhost:5000/api/ads/${ad._id}`,
        { isActive: !ad.isActive },
        config
      );
      fetchAds();
    } catch (error) {
      alert("Lỗi cập nhật");
    }
  };

  return (
    <div className="admin-list-container">
      <div className="admin-list-header">
        <h1>Quản Lý Banner Quảng Cáo</h1>
      </div>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        }}
      >
        <h3>Thêm Banner Mới</h3>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Link Ảnh (URL)
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
              required
            />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Link Đích (Khi bấm vào)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/product/123 hoặc https://google.com"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ width: "150px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Vị trí
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <option value="left">Trái</option>
              <option value="right">Phải</option>
            </select>
          </div>
          <button
            type="submit"
            className="admin-add-btn"
            style={{ height: "38px" }}
          >
            Thêm
          </button>
        </form>
      </div>

      <table className="admin-list-table">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Vị trí</th>
            <th>Link Đích</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad) => (
            <tr key={ad._id}>
              <td>
                <img
                  src={ad.image}
                  alt="Banner"
                  style={{ height: "50px", objectFit: "contain" }}
                />
              </td>
              <td>{ad.position === "left" ? "Trái" : "Phải"}</td>
              <td
                style={{
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {ad.link}
              </td>
              <td>
                <button
                  onClick={() => handleToggle(ad)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    background: ad.isActive ? "#dcfce7" : "#fee2e2",
                    color: ad.isActive ? "#166534" : "#991b1b",
                    fontWeight: "500",
                  }}
                >
                  {ad.isActive ? "Đang hiện" : "Đang ẩn"}
                </button>
              </td>
              <td>
                <button
                  className="admin-delete-btn"
                  onClick={() => handleDelete(ad._id)}
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

export default AdminAdPage;
