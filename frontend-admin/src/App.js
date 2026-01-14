import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

// Import Pages
import LoginPage from "./pages/LoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
// (Đã mở comment các trang này)
import AdminProductListPage from "./pages/AdminProductListPage";
import AdminCreateProduct from "./pages/AdminCreateProduct";
import AdminProductEditPage from "./pages/AdminProductEditPage";
import AdminOrderListPage from "./pages/AdminOrderListPage";
import AdminKeywordPage from "./pages/AdminKeywordPage";

// --- Admin Context ---
const AdminContext = createContext();
const AdminProvider = ({ children }) => {
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminInfo");
    if (storedAdmin) setAdminInfo(JSON.parse(storedAdmin));
  }, []);

  const login = (data) => {
    localStorage.setItem("adminInfo", JSON.stringify(data));
    setAdminInfo(data);
  };

  const logout = () => {
    localStorage.removeItem("adminInfo");
    setAdminInfo(null);
  };

  return (
    <AdminContext.Provider value={{ adminInfo, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};
export const useAdmin = () => useContext(AdminContext);

// --- Layout Admin ---
const AdminLayout = ({ children }) => {
  const { adminInfo, logout } = useAdmin();
  const location = useLocation();

  if (!adminInfo || !adminInfo.isAdmin) {
    return <Navigate to="/login" />;
  }

  const menuItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/products", label: "Sản Phẩm" },
    { path: "/orders", label: "Đơn Hàng" },
    { path: "/keywords", label: "Từ Khóa" },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
      }}
    >
      <aside
        style={{
          width: "250px",
          backgroundColor: "#343a40",
          color: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "20px",
            fontSize: "1.5rem",
            fontWeight: "bold",
            borderBottom: "1px solid #4b545c",
            textAlign: "center",
            color: "#ffc107",
          }}
        >
          ADMIN PANEL
        </div>
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #4b545c",
            fontSize: "0.9rem",
          }}
        >
          Xin chào, <strong>{adminInfo.name}</strong>
        </div>
        <nav style={{ flex: 1, padding: "10px" }}>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {menuItems.map((item) => (
              <li key={item.path} style={{ marginBottom: "5px" }}>
                <Link
                  to={item.path}
                  style={{
                    display: "block",
                    padding: "12px 15px",
                    color: location.pathname.startsWith(item.path)
                      ? "#fff"
                      : "#c2c7d0",
                    backgroundColor: location.pathname.startsWith(item.path)
                      ? "#007bff"
                      : "transparent",
                    textDecoration: "none",
                    borderRadius: "4px",
                    transition: "0.2s",
                    fontSize: "0.95rem",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: "20px", borderTop: "1px solid #4b545c" }}>
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Đăng Xuất
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route
            path="/dashboard"
            element={
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            }
          />

          <Route
            path="/products"
            element={
              <AdminLayout>
                <AdminProductListPage />
              </AdminLayout>
            }
          />

          <Route
            path="/product/create"
            element={
              <AdminLayout>
                <AdminCreateProduct />
              </AdminLayout>
            }
          />

          <Route
            path="/product/:id/edit"
            element={
              <AdminLayout>
                <AdminProductEditPage />
              </AdminLayout>
            }
          />

          <Route
            path="/orders"
            element={
              <AdminLayout>
                <AdminOrderListPage />
              </AdminLayout>
            }
          />

          <Route
            path="/keywords"
            element={
              <AdminLayout>
                <AdminKeywordPage />
              </AdminLayout>
            }
          />

          <Route path="*" element={<div>404 - Trang không tìm thấy</div>} />
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export default App;
