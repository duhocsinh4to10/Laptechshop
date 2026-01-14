import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Form.css";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // Thêm state cho thông báo
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const userInfo = localStorage.getItem("userInfo");

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };

      // Gọi API register
      const { data } = await axios.post(
        "http://localhost:5000/api/users/register",
        { name, email, password },
        config
      );

      setLoading(false);

      // SỬA LẠI CHỖ NÀY
      // KHÔNG đăng nhập vội, mà chuyển sang trang Verify
      navigate("/verify", { state: { email: data.email } });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h1>Đăng Ký</h1>
        {error && <div className="form-error">{error}</div>}
        {message && (
          <div
            className="form-error"
            style={{
              borderColor: "green",
              color: "green",
              background: "#e0f1e0",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={submitHandler}>
          {/* ... (Các input: name, email, password, confirmPassword giữ nguyên) ... */}
          <div className="form-group">
            <label>Tên của bạn</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên"
              required
            />
          </div>
          <div className="form-group">
            <label>Địa chỉ Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          <div className="form-group">
            <label>Xác nhận Mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu"
              required
            />
          </div>
          <button type="submit" className="form-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng Ký"}
          </button>
        </form>
        <div className="form-redirect">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
