import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import "./Form.css";
import { useUser } from "../App.js"; // <-- 1. IMPORT useUser TỪ App.js

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userInfo, login } = useUser(); // <-- 2. LẤY userInfo VÀ HÀM login TỪ CONTEXT

  useEffect(() => {
    // Nếu userInfo (từ context) đã tồn tại, chuyển về trang chủ
    if (userInfo) {
      navigate("/");
    }
  }, [userInfo, navigate]); // Phụ thuộc vào userInfo từ context

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };
      const { data } = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password },
        config
      );

      // --- 3. SỬ DỤNG HÀM login TỪ CONTEXT ---
      login(data); // Gọi hàm login để cập nhật state toàn cục và localStorage
      setLoading(false);
      // Không cần reload, useEffect ở trên sẽ tự chuyển hướng
      // window.location.href = '/';
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message || "Email hoặc mật khẩu không đúng";
      setError(errorMessage);

      // --- 4. KIỂM TRA PHẢN HỒI verificationRequired TỪ BACKEND ---
      if (err.response?.data?.verificationRequired) {
        // Nếu backend báo cần xác thực, chuyển sang trang /verify
        navigate("/verify", {
          state: { email: err.response.data.email || email },
        });
      }
      // --- KẾT THÚC KIỂM TRA ---
    }
  };

  // --- 5. SỬA HÀM GOOGLE LOGIN ĐỂ DÙNG CONTEXT ---
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/google-login",
        { token: credentialResponse.credential }
      );
      login(data); // Dùng hàm login từ context
      setLoading(false);
      // navigate('/'); // useEffect sẽ tự chuyển hướng
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Đăng nhập Google thất bại");
    }
  };
  const handleGoogleLoginError = () => {
    setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h1>Đăng Nhập</h1>
        {error && <div className="form-error">{error}</div>}
        <div
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            useOneTap
            width="300px" // Có thể điều chỉnh hoặc bỏ đi
          />
        </div>
        <p style={{ textAlign: "center", marginBottom: "1rem" }}>Hoặc</p>
        <form onSubmit={submitHandler}>
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
          <button type="submit" className="form-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>
        <div className="form-redirect">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
