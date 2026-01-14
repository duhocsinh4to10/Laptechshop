import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Form.css"; // Tái sử dụng CSS của Form đăng nhập

const ShippingPage = () => {
  const navigate = useNavigate();

  // Lấy dữ liệu cũ từ localStorage nếu có
  const savedAddress =
    JSON.parse(localStorage.getItem("shippingAddress")) || {};

  const [address, setAddress] = useState(savedAddress.address || "");
  const [city, setCity] = useState(savedAddress.city || "");
  const postalCode = savedAddress.postalCode || "";
  const [country, setCountry] = useState(savedAddress.country || "Việt Nam");
  const [phone, setPhone] = useState(savedAddress.phone || "");

  const submitHandler = (e) => {
    e.preventDefault();
    // Lưu thông tin vào localStorage
    localStorage.setItem(
      "shippingAddress",
      JSON.stringify({ address, city, postalCode, country, phone })
    );
    // Chuyển sang bước thanh toán
    navigate("/payment");
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h1>Thông Tin Giao Hàng</h1>
        {/* Thanh tiến trình đơn giản */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            color: "#888",
          }}
        >
          <span style={{ color: "#ff6600", fontWeight: "bold" }}>
            1. Giao hàng
          </span>
          <span style={{ margin: "0 10px" }}>&gt;</span>
          <span>2. Thanh toán</span>
          <span style={{ margin: "0 10px" }}>&gt;</span>
          <span>3. Hoàn tất</span>
        </div>

        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label>Địa chỉ nhận hàng</label>
            <input
              type="text"
              placeholder="Số nhà, tên đường, phường/xã"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Tỉnh / Thành phố</label>
            <input
              type="text"
              placeholder="Nhập tỉnh/thành phố"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại người nhận</label>
            <input
              type="text"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Quốc gia</label>
            <input
              type="text"
              placeholder="Việt Nam"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="form-btn">
            Tiếp tục đến Thanh Toán
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShippingPage;
