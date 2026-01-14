import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAdmin } from "../App"; // <-- Import từ App của Admin
import "./Form.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { adminInfo, login } = useAdmin(); // <-- Dùng useAdmin

  useEffect(() => {
    // Nếu đã đăng nhập, chuyển vào trang quản lý
    if (adminInfo) {
      navigate("/products");
    }
  }, [adminInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const config = { headers: { "Content-Type": "application/json" } };
      // Gọi API login chung (Backend localhost:5000)
      const { data } = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password },
        config
      );

      // Kiểm tra quyền Admin
      if (data.isAdmin) {
        login(data);
      } else {
        setError("Tài khoản này không có quyền truy cập Admin.");
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Đăng nhập thất bại.");
    }
  };

  return (
    <div
      className="form-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e9ecef",
        marginTop: 0,
        padding: 0,
      }}
    >
      <div
        className="form-wrapper"
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}
        >
          Đăng nhập Quản trị
        </h1>
        {error && (
          <div className="form-error" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={submitHandler}>
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              style={{ width: "100%", padding: "12px", marginTop: "5px" }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: "30px" }}>
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              style={{ width: "100%", padding: "12px", marginTop: "5px" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {loading ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
