import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useAdmin } from "../App";
import "./AdminOrderListPage.css"; // File CSS mới

// Cấu hình trạng thái
const STATUSES = {
  PENDING: { label: "Chờ xử lý", color: "status-yellow", icon: "fa-clock" },
  PAID: {
    label: "Đã thanh toán",
    color: "status-blue",
    icon: "fa-dollar-sign",
  },
  SHIPPING: {
    label: "Đang vận chuyển",
    color: "status-purple",
    icon: "fa-truck",
  },
  COMPLETED: {
    label: "Hoàn thành",
    color: "status-green",
    icon: "fa-check-circle",
  },
  CANCELLED: { label: "Đã hủy", color: "status-red", icon: "fa-times-circle" },
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount
  );
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const AdminOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // State cho Modal
  const { adminInfo } = useAdmin();

  // 1. Lấy dữ liệu
  const fetchOrders = useCallback(async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
      };
      const { data } = await axios.get(
        "http://localhost:5000/api/orders",
        config
      );
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [adminInfo]);

  useEffect(() => {
    if (adminInfo) fetchOrders();
  }, [adminInfo, fetchOrders]);

  // 2. Cập nhật trạng thái
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
      };
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        config
      );

      // Cập nhật UI ngay lập tức
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder)
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));

      alert(`Đã cập nhật trạng thái: ${STATUSES[newStatus].label}`);
    } catch (err) {
      alert("Lỗi cập nhật");
    }
  };

  // 3. Lọc và Tìm kiếm
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus =
        filterStatus === "ALL" || order.status === filterStatus;
      const matchSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, searchTerm]);

  // 4. Thống kê
  const stats = {
    total: orders.length,
    revenue: orders.reduce(
      (acc, o) => acc + (o.status === "COMPLETED" ? o.totalPrice : 0),
      0
    ),
    pending: orders.filter((o) => o.status === "PENDING").length,
    shipping: orders.filter((o) => o.status === "SHIPPING").length,
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="admin-order-page">
      {/* Header & Stats */}
      <div className="page-header">
        <h1>Quản Lý Đơn Hàng</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Doanh thu (Hoàn thành)</span>
            <strong className="stat-val text-green">
              {formatCurrency(stats.revenue)}
            </strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tổng đơn</span>
            <strong className="stat-val">{stats.total}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Chờ xử lý</span>
            <strong className="stat-val text-yellow">{stats.pending}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Đang giao</span>
            <strong className="stat-val text-purple">{stats.shipping}</strong>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="status-tabs">
          <button
            className={filterStatus === "ALL" ? "active" : ""}
            onClick={() => setFilterStatus("ALL")}
          >
            Tất cả
          </button>
          {Object.keys(STATUSES).map((key) => (
            <button
              key={key}
              className={
                filterStatus === key ? `active ${STATUSES[key].color}` : ""
              }
              onClick={() => setFilterStatus(key)}
            >
              {STATUSES[key].label}
            </button>
          ))}
        </div>
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Khách Hàng</th>
              <th>Ngày Đặt</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td className="font-mono">
                  #{order._id.slice(-6).toUpperCase()}
                </td>
                <td>
                  <div className="customer-info">
                    <strong>{order.shippingAddress?.name}</strong>
                    <small>{order.shippingAddress?.phone}</small>
                  </div>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td className="font-bold">
                  {formatCurrency(order.totalPrice)}
                </td>
                <td>
                  <span
                    className={`status-badge ${STATUSES[order.status]?.color}`}
                  >
                    <i className={`fas ${STATUSES[order.status]?.icon}`}></i>{" "}
                    {STATUSES[order.status]?.label}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-icon"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CHI TIẾT --- */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Đơn hàng #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
              <button
                className="btn-close"
                onClick={() => setSelectedOrder(null)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              {/* Cập nhật trạng thái */}
              <div className="status-control">
                <label>Cập nhật trạng thái:</label>
                <div className="status-actions">
                  {Object.keys(STATUSES).map((key) => (
                    <button
                      key={key}
                      className={`status-btn ${
                        selectedOrder.status === key
                          ? `active ${STATUSES[key].color}`
                          : ""
                      }`}
                      onClick={() => handleUpdateStatus(selectedOrder._id, key)}
                    >
                      {STATUSES[key].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="info-grid">
                <div className="info-col">
                  <h3>Thông tin khách hàng</h3>
                  <p>
                    <i className="fas fa-user"></i>{" "}
                    {selectedOrder.shippingAddress?.name}
                  </p>
                  <p>
                    <i className="fas fa-phone"></i>{" "}
                    {selectedOrder.shippingAddress?.phone}
                  </p>
                  <p>
                    <i className="fas fa-map-marker-alt"></i>{" "}
                    {selectedOrder.shippingAddress?.street},{" "}
                    {selectedOrder.shippingAddress?.ward},{" "}
                    {selectedOrder.shippingAddress?.district},{" "}
                    {selectedOrder.shippingAddress?.province}
                  </p>
                </div>
                <div className="info-col">
                  <h3>Chi tiết đơn hàng</h3>
                  <div className="item-list">
                    {selectedOrder.orderItems.map((item, i) => (
                      <div key={i} className="order-item-row">
                        <span>
                          {item.name} <span className="qty">x{item.qty}</span>
                        </span>
                        <span>{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-total-row">
                    <span>Tổng cộng</span>
                    <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderListPage;
