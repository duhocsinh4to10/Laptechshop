import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../App.js"; // Import hook useCart
import "./CartPage.css"; // CSS riêng
import { useUser } from "../App.js"; // Import useUser để kiểm tra login

const CartPage = () => {
  const { cartItems, addToCart, removeFromCart } = useCart();
  const { userInfo } = useUser(); // Lấy userInfo
  const navigate = useNavigate();

  // --- HÀM XỬ LÝ THANH TOÁN ---
  const handleCheckout = () => {
    if (!userInfo) {
      // Nếu chưa đăng nhập, chuyển đến login và yêu cầu quay lại payment
      navigate("/login?redirect=/payment");
    } else {
      // Nếu đã đăng nhập, chuyển đến trang chọn phương thức thanh toán
      navigate("/payment");
    }
  };
  // --- KẾT THÚC HÀM XỬ LÝ ---

  // Tính tổng số lượng và tổng tiền (có xử lý an toàn với || 0)
  const totalItems = cartItems.reduce((acc, item) => acc + (item.qty || 0), 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + (item.qty || 0) * (item.price || 0),
    0
  );

  return (
    <div className="cart-container">
      <h1>Giỏ Hàng Của Bạn</h1>
      {cartItems.length === 0 ? (
        <div className="cart-empty">
          Giỏ hàng đang trống. <Link to="/">Quay lại mua sắm</Link>
        </div>
      ) : (
        <div className="cart-grid">
          {/* Danh sách sản phẩm trong giỏ */}
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-name">
                  <Link to={`/product/${item._id}`}>{item.name}</Link>
                </div>
                <div className="cart-item-price">
                  {(item.price || 0).toLocaleString("vi-VN")} ₫
                </div>
                <div className="cart-item-qty">
                  {/* Select số lượng */}
                  <select
                    value={item.qty}
                    onChange={(e) => addToCart(item, Number(e.target.value))}
                    disabled={!item.countInStock || item.countInStock <= 0} // Vô hiệu hóa nếu hết hàng
                  >
                    {/* Tạo các option dựa trên số lượng tồn kho (tối đa 10) */}
                    {[
                      ...Array(Math.min(item.countInStock || 0, 10)).keys(),
                    ].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                  {/* Hiển thị thông báo nếu hết hàng */}
                  {(!item.countInStock || item.countInStock <= 0) && (
                    <span
                      style={{
                        color: "red",
                        fontSize: "0.8em",
                        marginLeft: "5px",
                      }}
                    >
                      Hết hàng
                    </span>
                  )}
                </div>
                <div className="cart-item-remove">
                  {/* Nút xóa sản phẩm */}
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Phần tóm tắt đơn hàng */}
          <div className="cart-summary">
            <div className="summary-box">
              <h2>Tổng Cộng</h2>
              <div className="summary-row">
                <span>Tổng sản phẩm:</span>
                <span>{totalItems}</span>
              </div>
              <div className="summary-row total-price">
                <span>Thành tiền:</span>
                <span>{totalPrice.toLocaleString("vi-VN")} ₫</span>
              </div>
              {/* Nút tiến hành thanh toán */}
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={cartItems.length === 0} // Tắt nút nếu giỏ hàng trống
              >
                Tiến hành Thanh Toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
