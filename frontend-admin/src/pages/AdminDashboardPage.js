import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAdmin } from "../App";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./AdminDashboardPage.css"; // Sẽ tạo CSS sau

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    chartData: [],
  });
  const [loading, setLoading] = useState(true);
  const { adminInfo } = useAdmin();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${adminInfo.token}` },
        };
        const { data } = await axios.get(
          "http://localhost:5000/api/orders/stats",
          config
        );
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
        setLoading(false);
      }
    };
    if (adminInfo && adminInfo.isAdmin) fetchStats();
  }, [adminInfo]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Đang tải thống kê...
      </div>
    );

  return (
    <div className="admin-dashboard">
      <h1 style={{ marginBottom: "30px", color: "#333" }}>
        Dashboard Quản Trị
      </h1>

      {/* Stats Cards */}
      <div className="stats-cards-container">
        <div className="stat-card bg-blue">
          <h3>Doanh Thu Hôm Nay</h3>
          <p>{stats.dailyRevenue.toLocaleString("vi-VN")} ₫</p>
        </div>
        <div className="stat-card bg-green">
          <h3>Doanh Thu Tháng Này</h3>
          <p>{stats.monthlyRevenue.toLocaleString("vi-VN")} ₫</p>
        </div>
        <div className="stat-card bg-orange">
          <h3>Tổng Doanh Thu</h3>
          <p>{stats.totalRevenue.toLocaleString("vi-VN")} ₫</p>
        </div>
        <div className="stat-card bg-purple">
          <h3>Tổng Đơn Hàng</h3>
          <p>{stats.totalOrders}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <h2
          style={{
            marginBottom: "20px",
            color: "#555",
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
          }}
        >
          Biểu đồ Doanh thu Tháng này
        </h2>
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={stats.chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                label={{
                  value: "Ngày",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis
                label={{ value: "VNĐ", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("vi-VN").format(value) + " ₫"
                }
              />
              <Legend />
              <Bar dataKey="sales" name="Doanh thu" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
