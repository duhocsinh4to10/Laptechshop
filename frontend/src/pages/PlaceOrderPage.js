import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Form.css"; // CSS chung cho form
import "./PaymentPage.css"; // CSS riêng cho trang thanh toán
import { useUser } from "../App.js";
import { useCart } from "../App.js";

// --- ĐƯỜNG DẪN ẢNH QR CỦA BẠN ---
// Bạn hãy copy ảnh QR của mình vào thư mục 'frontend/public/images/' và đặt tên là 'my-qr.jpg'
const QR_CODE_IMAGE = "/images/my-qr.jpg";

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const navigate = useNavigate();
  const { userInfo } = useUser();
  const { cartItems } = useCart();

  // Tính tổng tiền để hiển thị cho khách biết cần chuyển bao nhiêu
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );

  useEffect(() => {
    if (!userInfo) {
      navigate("/login?redirect=/payment");
    }
    // Kiểm tra nếu chưa có địa chỉ giao hàng thì quay lại
    const shippingAddress = localStorage.getItem("shippingAddress");
    if (!shippingAddress) {
      navigate("/shipping");
    }
  }, [userInfo, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    // Lưu phương thức thanh toán vào localStorage để dùng ở bước tiếp theo (PlaceOrder)
    localStorage.setItem("paymentMethod", paymentMethod);
    navigate("/placeorder");
  };

  return (
    <div className="form-container">
      <div className="form-wrapper payment-wrapper">
        <h1 className="payment-title">Phương Thức Thanh Toán</h1>

        {/* Progress Bar (Optional) */}
        <div className="checkout-steps">
          <div className="step completed">Giao hàng</div>
          <div className="step active">Thanh toán</div>
          <div className="step">Đặt hàng</div>
        </div>

        <form onSubmit={submitHandler}>
          {/* Lựa chọn 1: COD */}
          <div
            className={`payment-option ${
              paymentMethod === "COD" ? "selected" : ""
            }`}
          >
            <label htmlFor="cod" className="payment-label">
              <div className="payment-radio">
                <input
                  type="radio"
                  id="cod"
                  value="COD"
                  name="paymentMethod"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </div>
              <div className="payment-content">
                <span className="payment-name">
                  Thanh toán khi nhận hàng (COD)
                </span>
                <span className="payment-desc">
                  Bạn sẽ thanh toán tiền mặt cho shipper khi nhận hàng.
                </span>
              </div>
              <div className="payment-icon">
                <i className="fas fa-money-bill-wave"></i>
              </div>
            </label>
          </div>

          {/* Lựa chọn 2: QR Code / VNPay */}
          <div
            className={`payment-option ${
              paymentMethod === "QR_PAY" ? "selected" : ""
            }`}
          >
            <label htmlFor="qr" className="payment-label">
              <div className="payment-radio">
                <input
                  type="radio"
                  id="qr"
                  value="QR_PAY"
                  name="paymentMethod"
                  checked={paymentMethod === "QR_PAY"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </div>
              <div className="payment-content">
                <span className="payment-name">
                  Chuyển khoản Ngân hàng / VNPay
                </span>
                <span className="payment-desc">
                  Quét mã QR để thanh toán nhanh chóng.
                </span>
              </div>
              <div className="payment-icon">
                <i className="fas fa-qrcode"></i>
              </div>
            </label>
          </div>

          {/* Hiển thị QR Code nếu chọn QR_PAY */}
          {paymentMethod === "QR_PAY" && (
            <div className="qr-section animate-fade-in">
              <div className="qr-header">
                <h3>
                  <i className="fas fa-scan"></i> Quét mã để thanh toán
                </h3>
                <p className="qr-total-amount">
                  Số tiền: {totalPrice.toLocaleString("vi-VN")} ₫
                </p>
              </div>

              <div className="qr-body">
                <div className="qr-image-container">
                  <img
                    src={QR_CODE_IMAGE}
                    alt="Mã QR Thanh Toán"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x300?text=QR+Code+Error";
                      e.target.alt = "Lỗi tải ảnh QR";
                    }}
                  />
                </div>

                <div className="qr-details">
                  <div className="qr-row">
                    <span className="qr-label">Ngân hàng:</span>
                    <span className="qr-value">MB Bank</span>
                  </div>
                  <div className="qr-row">
                    <span className="qr-label">Số TK:</span>
                    <span className="qr-value text-blue">0386905831</span>
                  </div>
                  <div className="qr-row">
                    <span className="qr-label">Chủ TK:</span>
                    <span className="qr-value">NGUYEN TIEN DAT</span>
                  </div>
                  <div className="qr-row">
                    <span className="qr-label">Nội dung:</span>
                    <span className="qr-value text-red">[Tên bạn] + SĐT</span>
                  </div>
                </div>
              </div>

              <p className="qr-note">
                <i className="fas fa-info-circle"></i> Sau khi chuyển khoản, vui
                lòng ấn nút <strong>"Tiếp tục"</strong> bên dưới để hoàn tất đơn
                hàng.
              </p>
            </div>
          )}

          {/* Lựa chọn 3: Thẻ tín dụng (Disabled) */}
          <div className="payment-option disabled">
            <label className="payment-label">
              <div className="payment-radio">
                <input type="radio" disabled />
              </div>
              <div className="payment-content">
                <span className="payment-name">
                  Thẻ Tín dụng / Ghi nợ (Visa/Master)
                </span>
                <span className="payment-desc">
                  Tính năng đang được bảo trì.
                </span>
              </div>
              <div className="payment-icon">
                <i className="far fa-credit-card"></i>
              </div>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="form-btn mt-3">
              Tiếp tục
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
