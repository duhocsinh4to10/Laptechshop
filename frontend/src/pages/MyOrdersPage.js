import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "../App.js";
import "./MyOrdersPage.css";
const STATUS_CONFIG = {
  ALL: { label: "Tất cả", color: "bg-gray-100 text-gray-700" },
  PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Đã thanh toán", color: "bg-blue-100 text-blue-800" },
  SHIPPING: {
    label: "Đang vận chuyển",
    color: "bg-purple-100 text-purple-800",
  },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

// Hàm helper format tiền
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Hàm helper format ngày
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State cho bộ lọc và tìm kiếm
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // State cho Modal chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);

  const navigate = useNavigate();
  const { userInfo } = useUser();

  // --- 1. LẤY DỮ LIỆU TỪ BACKEND ---
  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      // Gọi API lấy danh sách đơn hàng của tôi
      const { data } = await axios.get(
        "http://localhost:5000/api/orders/myorders",
        config
      );

      // Chuẩn hóa dữ liệu (thêm status nếu thiếu)
      const normalizedData = data.map((order) => ({
        ...order,
        status:
          order.status ||
          (order.isDelivered ? "COMPLETED" : order.isPaid ? "PAID" : "PENDING"),
      }));

      setOrders(normalizedData);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else {
      fetchMyOrders();
    }
  }, [userInfo, navigate]);

  // --- HÀM HỦY ĐƠN HÀNG ---
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };

        await axios.put(
          `http://localhost:5000/api/orders/${orderId}/cancel`,
          {},
          config
        );

        alert("Đã hủy đơn hàng thành công!");
        fetchMyOrders(); // Tải lại danh sách
        if (selectedOrder) setSelectedOrder(null); // Đóng modal nếu đang mở
      } catch (err) {
        alert(
          err.response?.data?.message ||
            "Hủy đơn hàng thất bại. Vui lòng liên hệ hỗ trợ."
        );
      }
    }
  };

  // --- 2. LỌC VÀ TÌM KIẾM ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Lọc theo Tab (Trạng thái) - Bao gồm cả tab "Đang vận chuyển"
      const matchesTab = activeTab === "ALL" || order.status === activeTab;

      // Lọc theo Tìm kiếm (Mã đơn hoặc Tên sản phẩm đầu tiên)
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderItems[0]?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchTerm]);

  return (
    <div className="my-orders-page">
      <div className="page-header">
        <h1>Đơn hàng của tôi</h1>
        <p>Quản lý và theo dõi lịch sử mua hàng của bạn</p>
      </div>

      {/* --- Filter Tabs (Các nút lọc) --- */}
      <div className="filter-tabs-container">
        <div className="filter-tabs">
          {Object.keys(STATUS_CONFIG).map((statusKey) => (
            <button
              key={statusKey}
              className={`filter-tab ${
                activeTab === statusKey ? "active" : ""
              }`}
              onClick={() => setActiveTab(statusKey)}
            >
              {STATUS_CONFIG[statusKey].label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Search Bar --- */}
      <div className="order-search-bar">
        <i className="fas fa-search search-icon"></i>
        <input
          type="text"
          placeholder="Tìm kiếm theo Mã đơn hàng hoặc Tên sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- Order List --- */}
      <div className="orders-list-container">
        {loading ? (
          <div className="loading-state">Đang tải đơn hàng...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Không tìm thấy đơn hàng nào</h3>
            <p>Bạn chưa có đơn hàng nào trong mục này.</p>
            <Link to="/" className="btn-shop-now">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                {/* Card Header: ID, Date, Status */}
                <div className="order-card-header">
                  <div className="order-id">
                    <span className="label">Đơn hàng</span>
                    <span className="value">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="order-date">
                    {formatDate(order.createdAt)}
                  </div>
                  <div
                    className={`order-status ${
                      STATUS_CONFIG[order.status]?.color
                    }`}
                  >
                    {STATUS_CONFIG[order.status]?.label}
                  </div>
                </div>

                {/* Card Body: Items Preview (Chỉ hiện 1 sp đầu tiên) */}
                <div className="order-card-body">
                  <div className="item-preview">
                    <div className="item-image">
                      <img
                        src={order.orderItems[0].image}
                        alt={order.orderItems[0].name}
                      />
                    </div>
                    <div className="item-info">
                      <h4>{order.orderItems[0].name}</h4>
                      {order.orderItems.length > 1 && (
                        <span className="more-items">
                          và {order.orderItems.length - 1} sản phẩm khác
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Total & Actions */}
                <div className="order-card-footer">
                  <div className="order-total">
                    <span>Tổng tiền:</span>
                    <strong>{formatCurrency(order.totalPrice)}</strong>
                  </div>
                  <div className="order-actions">
                    <button
                      className="btn-detail"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Xem chi tiết
                    </button>

                    {/* Nút hủy đơn hàng: Chỉ hiện khi chưa vận chuyển */}
                    {["PENDING", "PAID"].includes(order.status) && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Hủy đơn hàng
                      </button>
                    )}

                    {["COMPLETED", "CANCELLED"].includes(order.status) && (
                      <button
                        className="btn-rebuy"
                        onClick={() =>
                          alert("Chức năng mua lại đang phát triển")
                        }
                      >
                        Mua lại
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Modal Chi Tiết Đơn Hàng --- */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Chi tiết đơn hàng #{selectedOrder._id.slice(-6).toUpperCase()}
              </h2>
              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {/* Stepper trạng thái đơn giản */}
              <div className="order-stepper">
                <div
                  className={`step ${
                    ["PENDING", "PAID", "SHIPPING", "COMPLETED"].includes(
                      selectedOrder.status
                    )
                      ? "active"
                      : ""
                  }`}
                >
                  Đã đặt
                </div>
                <div className="line"></div>
                <div
                  className={`step ${
                    ["PAID", "SHIPPING", "COMPLETED"].includes(
                      selectedOrder.status
                    )
                      ? "active"
                      : ""
                  }`}
                >
                  Đã thanh toán
                </div>
                <div className="line"></div>
                <div
                  className={`step ${
                    ["SHIPPING", "COMPLETED"].includes(selectedOrder.status)
                      ? "active"
                      : ""
                  }`}
                >
                  Vận chuyển
                </div>
                <div className="line"></div>
                <div
                  className={`step ${
                    selectedOrder.status === "COMPLETED" ? "active" : ""
                  }`}
                >
                  Hoàn thành
                </div>
              </div>

              <div className="detail-section">
                <h3>Địa chỉ nhận hàng</h3>
                <p>
                  <strong>{selectedOrder.shippingAddress.name}</strong>
                </p>
                <p>{selectedOrder.shippingAddress.phone}</p>
                <p>
                  {selectedOrder.shippingAddress.street},{" "}
                  {selectedOrder.shippingAddress.ward},{" "}
                  {selectedOrder.shippingAddress.district},{" "}
                  {selectedOrder.shippingAddress.province}
                </p>
              </div>

              <div className="detail-section">
                <h3>Sản phẩm</h3>
                <div className="detail-items-list">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="detail-item">
                      <img src={item.image} alt={item.name} />
                      <div className="detail-item-info">
                        <p className="name">{item.name}</p>
                        <p className="qty">x{item.qty}</p>
                      </div>
                      <div className="detail-item-price">
                        {formatCurrency(item.price * item.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-summary">
                <div className="summary-row">
                  <span>Tiền hàng</span>
                  <span>{formatCurrency(selectedOrder.itemsPrice)}</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển</span>
                  <span>{formatCurrency(selectedOrder.shippingPrice)}</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                </div>
                <div className="summary-row method">
                  <span>Phương thức TT</span>
                  <span>{selectedOrder.paymentMethod}</span>
                </div>
              </div>

              {/* Nút hủy trong Modal */}
              <div className="modal-footer-actions">
                {["PENDING", "PAID"].includes(selectedOrder.status) && (
                  <button
                    className="btn-cancel-modal"
                    onClick={() => handleCancelOrder(selectedOrder._id)}
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
