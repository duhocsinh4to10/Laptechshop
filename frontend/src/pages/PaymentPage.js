import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Form.css";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Kiểm tra nếu chưa nhập địa chỉ thì đẩy về trang Shipping
  useEffect(() => {
    const shippingAddress = localStorage.getItem("shippingAddress");
    if (!shippingAddress) {
      navigate("/shipping");
    }
  }, [navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    localStorage.setItem("paymentMethod", paymentMethod);
    // Chuyển sang trang đặt hàng (Bước cuối)
    navigate("/placeorder");
  };

  return (
    <div className="form-container">
      <div className="form-wrapper" style={{ maxWidth: "600px" }}>
        <h1>Phương Thức Thanh Toán</h1>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            color: "#888",
          }}
        >
          <span>1. Giao hàng</span>
          <span style={{ margin: "0 10px" }}>&gt;</span>
          <span style={{ color: "#ff6600", fontWeight: "bold" }}>
            2. Thanh toán
          </span>
          <span style={{ margin: "0 10px" }}>&gt;</span>
          <span>3. Hoàn tất</span>
        </div>

        <form onSubmit={submitHandler}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
                cursor: "pointer",
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <input
                type="radio"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginRight: "10px" }}
              />
              <div>
                <strong style={{ display: "block" }}>
                  Thanh toán khi nhận hàng (COD)
                </strong>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>
                  Bạn sẽ thanh toán tiền mặt cho shipper khi nhận được hàng.
                </span>
              </div>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
                cursor: "pointer",
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <input
                type="radio"
                value="Banking"
                checked={paymentMethod === "Banking"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginRight: "10px" }}
              />
              <div>
                <strong style={{ display: "block" }}>
                  Chuyển khoản Ngân hàng / Quét mã QR
                </strong>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>
                  Hỗ trợ VietQR, VNPay, Momo, Banking.
                </span>
              </div>
            </label>

            {/* Hiển thị QR Code nếu chọn Banking */}
            {paymentMethod === "Banking" && (
              <div
                style={{
                  textAlign: "center",
                  margin: "20px 0",
                  padding: "20px",
                  border: "2px dashed #ff6600",
                  borderRadius: "10px",
                  backgroundColor: "#fff5eb",
                }}
              >
                <h3 style={{ marginBottom: "10px" }}>Quét mã để thanh toán</h3>
                {/* Thay đường dẫn ảnh dưới đây bằng ảnh QR thật của bạn trong folder public/images */}
                <img
                  src="/images/qr-code.jpg"
                  alt="QR Code Thanh Toan"
                  style={{ maxWidth: "200px", marginBottom: "10px" }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/200x200?text=QR+Code+Error";
                  }} // Fallback nếu lỗi
                />
                <p style={{ fontWeight: "bold", color: "#333" }}>
                  Ngân hàng: MB Bank
                </p>
                <p>Số TK: 123456789 (LapTech Shop)</p>
                <p style={{ fontSize: "0.9rem", color: "red" }}>
                  Nội dung CK: [Tên của bạn] + [SĐT]
                </p>
              </div>
            )}

            <label
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
                cursor: "pointer",
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "5px",
                opacity: "0.6",
              }}
            >
              <input
                type="radio"
                value="CreditCard"
                disabled
                style={{ marginRight: "10px" }}
              />
              <div>
                <strong style={{ display: "block" }}>
                  Thẻ Tín dụng / Ghi nợ Quốc tế (Visa/Master)
                </strong>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>
                  Chức năng đang bảo trì.
                </span>
              </div>
            </label>
          </div>

          <button type="submit" className="form-btn">
            Tiếp tục
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
