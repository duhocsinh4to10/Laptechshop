import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Form.css"; // Dùng chung CSS
import { useUser } from "../App.js"; // Import hook để lấy userInfo và cập nhật sau khi sửa

const ProfilePage = () => {
  // States cho thông tin người dùng
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [street, setStreet] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // States cho loading, lỗi, thông báo thành công
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const { userInfo, login } = useUser(); // Lấy userInfo hiện tại và hàm login (để cập nhật state toàn cục)

  // --- Lấy thông tin profile khi trang tải ---
  useEffect(() => {
    // Nếu chưa đăng nhập, chuyển về trang login
    if (!userInfo) {
      navigate("/login");
      return; // Dừng effect
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`, // Gửi token để xác thực
          },
        };
        // Gọi API GET /api/users/profile
        const { data } = await axios.get(
          "http://localhost:5000/api/users/profile",
          config
        );

        // Điền thông tin lấy được vào form
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setGender(data.gender || "");
        setIdCardNumber(data.idCardNumber || "");
        if (data.address) {
          setStreet(data.address.street || "");
          setWard(data.address.ward || "");
          setDistrict(data.address.district || "");
          setProvince(data.address.province || "");
        }
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message || "Không thể tải thông tin cá nhân."
        );
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userInfo, navigate]); // Chạy lại nếu userInfo thay đổi (ví dụ: sau khi update)

  // --- Xử lý khi nhấn nút Cập Nhật ---
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Dữ liệu cần gửi lên
      const updateData = {
        name,
        email,
        phone,
        gender,
        address: { street, ward, district, province },
        idCardNumber,
      };
      // Chỉ gửi mật khẩu nếu người dùng nhập
      if (password) {
        updateData.password = password;
      }

      // Gọi API PUT /api/users/profile
      const { data } = await axios.put(
        "http://localhost:5000/api/users/profile",
        updateData,
        config
      );

      setLoading(false);
      setSuccess("Cập nhật thông tin thành công!");
      // Cập nhật lại userInfo trong context (và localStorage) với dữ liệu mới từ backend
      login(data);
      // Xóa mật khẩu khỏi form sau khi cập nhật thành công
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Cập nhật thất bại.");
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper" style={{ maxWidth: "600px" }}>
        {" "}
        {/* Tăng chiều rộng */}
        <h1>Thông Tin Cá Nhân</h1>
        {loading && <p>Đang tải...</p>}
        {error && <div className="form-error">{error}</div>}
        {success && (
          <div
            className="form-error"
            style={{
              borderColor: "green",
              color: "green",
              background: "#e0f1e0",
            }}
          >
            {success}
          </div>
        )}
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label>Họ và Tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Địa chỉ Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Số Điện Thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Giới Tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{
                width: "100%",
                padding: "0.8rem 1rem",
                fontSize: "1rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <h2
            style={{
              marginTop: "2rem",
              marginBottom: "1rem",
              fontSize: "1.2rem",
              borderTop: "1px solid #eee",
              paddingTop: "1rem",
            }}
          >
            Địa Chỉ
          </h2>
          <div className="form-group">
            <label>Số nhà, Tên đường</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Ví dụ: 123 Nguyễn Huệ"
            />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            {" "}
            {/* Sắp xếp Xã/Huyện/Tỉnh thành hàng ngang */}
            <div className="form-group" style={{ flex: 1 }}>
              <label>Phường/Xã</label>
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="Ví dụ: Phường Bến Nghé"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Quận/Huyện</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Ví dụ: Quận 1"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Tỉnh/Thành phố</label>
            <input
              type="text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="Ví dụ: TP. Hồ Chí Minh"
            />
            {/* // TODO: Thêm dropdown gợi ý sau */}
          </div>

          <h2
            style={{
              marginTop: "2rem",
              marginBottom: "1rem",
              fontSize: "1.2rem",
              borderTop: "1px solid #eee",
              paddingTop: "1rem",
            }}
          >
            Thông Tin Khác
          </h2>
          <div className="form-group">
            <label>Số CCCD/ID Card</label>
            <input
              type="text"
              value={idCardNumber}
              onChange={(e) => setIdCardNumber(e.target.value)}
              placeholder="Nhập số CCCD/ID Card"
            />
          </div>

          <h2
            style={{
              marginTop: "2rem",
              marginBottom: "1rem",
              fontSize: "1.2rem",
              borderTop: "1px solid #eee",
              paddingTop: "1rem",
            }}
          >
            Đổi Mật Khẩu (Để trống nếu không đổi)
          </h2>
          <div className="form-group">
            <label>Mật Khẩu Mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
            />
          </div>
          <div className="form-group">
            <label>Xác Nhận Mật Khẩu Mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <button type="submit" className="form-btn" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Cập Nhật Thông Tin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
