import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Form.css"; // Dùng chung CSS với form Login

const VerifyPage = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Lấy email từ trang Đăng Ký chuyển sang
  const email = location.state?.email;

  // Nếu không có email, quay về trang đăng ký
  if (!email) {
    navigate("/register");
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };
      // Gọi API xác thực
      const { data } = await axios.post(
        "http://localhost:5000/api/users/verify-email",
        { email, otp },
        config
      );

      // Xác thực thành công, đăng nhập user
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      window.location.href = "/"; // Tải lại trang chủ
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Xác thực thất bại");
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h1>Xác Thực Email</h1>
        <p style={{ textAlign: "center", marginBottom: "1rem" }}>
          Mã OTP đã được gửi tới <strong>{email}</strong>. Vui lòng kiểm tra
          email.
        </p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label>Mã OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP 6 số"
              required
            />
          </div>
          <button type="submit" className="form-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Xác Thực"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyPage;
