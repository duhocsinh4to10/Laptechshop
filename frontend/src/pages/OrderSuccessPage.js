import React, { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./OrderSuccessPage.css";
import { useCart } from "../App.js";

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  // Lấy thông tin từ query params (nếu được chuyển về từ VNPay)
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
  const vnp_TransactionStatus = searchParams.get("vnp_TransactionStatus");
  const orderId = searchParams.get("vnp_TxnRef"); // Mã đơn hàng

  // Xử lý khi component mount
  useEffect(() => {
    // Nếu thanh toán thành công (hoặc là COD chuyển qua đây)
    // 00 là mã thành công của VNPay
    if (!vnp_ResponseCode || vnp_ResponseCode === "00") {
      clearCart();
    }
  }, [vnp_ResponseCode, clearCart]);

  let content;

  if (vnp_ResponseCode && vnp_ResponseCode !== "00") {
    // Trường hợp thanh toán thất bại
    content = (
      <div className="success-card error">
        <div className="icon-container">
          <i className="fas fa-times-circle error-icon"></i>
        </div>
        <h1>Thanh Toán Thất Bại!</h1>
        <p>Giao dịch của bạn không thành công hoặc đã bị hủy.</p>
        <p>Mã lỗi: {vnp_ResponseCode}</p>
        <div className="actions">
          <Link to="/payment" className="btn-primary">
            Thử Thanh Toán Lại
          </Link>
          <Link to="/" className="btn-secondary">
            Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  } else {
    // Trường hợp thành công (COD hoặc VNPay thành công)
    content = (
      <div className="success-card">
        <div className="icon-container">
          <i className="fas fa-check-circle success-icon"></i>
        </div>
        <h1>Đặt Hàng Thành Công!</h1>
        <p>Cảm ơn bạn đã mua sắm tại LapTechShop.</p>
        {orderId && (
          <p>
            Mã đơn hàng: <strong>{orderId}</strong>
          </p>
        )}
        <p>Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng của bạn.</p>

        <div className="actions">
          <Link to="/myorders" className="btn-primary">
            Xem Đơn Hàng Của Tôi
          </Link>
          <Link to="/" className="btn-secondary">
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </div>
    );
  }

  return <div className="order-success-container">{content}</div>;
};

export default OrderSuccessPage;
