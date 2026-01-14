import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../App.js";
import "./AdminOrderListPage.css";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ xử lý", color: "bg-yellow" },
  { value: "PAID", label: "Đã thanh toán", color: "bg-blue" },
  { value: "SHIPPING", label: "Đang vận chuyển", color: "bg-gray" },
  { value: "COMPLETED", label: "Hoàn thành", color: "bg-green" },
  { value: "CANCELLED", label: "Đã hủy", color: "bg-red" },
];

const AdminOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const navigate = useNavigate();
  const { userInfo } = useUser();

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(
        "http://localhost:5000/api/orders",
        config
      );

      // Chuẩn hóa data nếu thiếu status
      const normalizedData = data.map((order) => ({
        ...order,
        status:
          order.status ||
          (order.isDelivered ? "COMPLETED" : order.isPaid ? "PAID" : "PENDING"),
      }));
      setOrders(normalizedData);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
      setLoading(false);
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      fetchOrders();
    } else {
      navigate("/login");
    }
  }, [userInfo, navigate, fetchOrders]);

  // Update Status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        config
      );

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      alert("Cập nhật trạng thái thành công!");
    } catch (err) {
      alert("Cập nhật thất bại");
    }
  };

  // Filter
  const filteredOrders =
    filterStatus === "ALL"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  if (loading)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Đang tải...</div>
    );

  return (
    <div className="admin-order-container">
      <div className="admin-header">
        <h1>Quản Lý Đơn Hàng</h1>
      </div>

      <div className="filter-bar">
        <label>Lọc theo trạng thái: </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Tất cả</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách Hàng</th>
              <th>Ngày Đặt</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Không có đơn hàng nào.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="mono-font">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>
                  <td>
                    <div className="customer-info">
                      <strong>{order.shippingAddress?.name}</strong>
                      <br />
                      <small>{order.shippingAddress?.phone}</small>
                    </div>
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td>{order.totalPrice.toLocaleString("vi-VN")} ₫</td>
                  <td>
                    <span
                      className={`status-badge status-${
                        order.status ? order.status.toLowerCase() : "pending"
                      }`}
                    >
                      {STATUS_OPTIONS.find((o) => o.value === order.status)
                        ?.label || order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="status-select"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderListPage;
