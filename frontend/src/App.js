import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react"; // Thêm useRef
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios"; // Import axios

// --- IMPORT CÁC TRANG (PAGES) ---
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyPage from "./pages/VerifyPage.js";
import ProductPage from "./pages/ProductPage.js";
import CartPage from "./pages/CartPage.js";
import ShippingPage from "./pages/ShippingPage.js";
import PlaceOrderPage from "./pages/PlaceOrderPage.js";
import OrderSuccessPage from "./pages/OrderSuccessPage.js";
import ProfilePage from "./pages/ProfilePage.js";
import PaymentPage from "./pages/PaymentPage.js";
import MyOrdersPage from "./pages/MyOrdersPage.js";

// --- IMPORT TRANG ADMIN ---
import AdminProductListPage from "./pages/AdminProductListPage.js";
import AdminCreateProduct from "./pages/AdminCreateProduct.js";
import AdminProductEditPage from "./pages/AdminProductEditPage.js";
import AdminOrderListPage from "./pages/AdminOrderListPage.js";
import AdminKeywordPage from "./pages/AdminKeywordPage.js";

// --- IMPORT COMPONENTS ---
import Chatbot from "./components/Chatbot.js";
import Footer from "./components/Footer.js";
import logoImage from "./assets/logo1.png";

import "./App.css";

// --- 1. CART CONTEXT (Giữ nguyên) ---
const cartFromStorage = localStorage.getItem("cartItems")
  ? JSON.parse(localStorage.getItem("cartItems"))
  : [];
const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(cartFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart items", e);
    }
  }, [cartItems]);

  const addToCart = (product, qty) => {
    if (!product || !product._id || typeof qty !== "number" || qty <= 0) return;
    const existItem = cartItems.find((x) => x._id === product._id);
    if (existItem) {
      setCartItems(
        cartItems.map((x) =>
          x._id === existItem._id ? { ...product, qty } : x
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, qty }]);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x._id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);

// --- 2. USER CONTEXT (Giữ nguyên) ---
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem("userInfo");
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
    } catch (e) {
      localStorage.removeItem("userInfo");
    }
  }, []);

  const login = (userData) => {
    try {
      localStorage.setItem("userInfo", JSON.stringify(userData));
      setUserInfo(userData);
    } catch (e) {}
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ userInfo, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
export const useUser = () => useContext(UserContext);

// --- 3. SEARCH CONTEXT (Giữ nguyên) ---
const SearchContext = createContext();

const SearchProvider = ({ children, navigate }) => {
  const [keyword, setKeyword] = useState("");
  const location = useLocation();

  const searchHandler = (e) => {
    e.preventDefault();
    navigate(`/?keyword=${encodeURIComponent(keyword)}`, { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keywordFromUrl = params.get("keyword") || "";
    if (decodeURIComponent(keywordFromUrl) !== keyword) {
      setKeyword(decodeURIComponent(keywordFromUrl));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <SearchContext.Provider value={{ keyword, setKeyword, searchHandler }}>
      {children}
    </SearchContext.Provider>
  );
};
export const useSearch = () => useContext(SearchContext);

// --- COMPONENT HEADER (CẬP NHẬT LIVE SEARCH) ---
const Header = () => {
  const { userInfo, logout } = useUser();
  const { cartItems } = useCart();
  const location = useLocation();
  const { keyword, setKeyword, searchHandler } = useSearch();

  // --- STATE & REF CHO LIVE SEARCH ---
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Gọi API gợi ý
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (keyword.trim().length > 1) {
        try {
          // Gọi API suggestion (đã tạo ở Backend)
          const { data } = await axios.get(
            `http://localhost:5000/api/products/suggestions?keyword=${keyword}`
          );
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Lỗi gợi ý:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    // Debounce 300ms
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [keyword]);

  // Ẩn khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  // Xử lý click vào gợi ý
  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    setKeyword("");
    navigate(`/product/${productId}`);
  };

  const cartItemCount = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => acc + (item.qty || 0), 0)
    : 0;

  const subNavLinks = [
    { path: "/", name: "Sản phẩm" },
    { path: "/solutions", name: "Giải pháp" },
    { path: "/services", name: "Dịch vụ" },
    { path: "/support", name: "Hỗ trợ" },
    { path: "/about", name: "Về LapTechShop" },
  ];

  const authPages = [
    "/login",
    "/register",
    "/verify",
    "/shipping",
    "/payment",
    "/placeorder",
    "/order-success",
  ];
  const shouldHideSubNav =
    authPages.some((page) => location.pathname.startsWith(page)) ||
    (userInfo && userInfo.isAdmin);

  return (
    <header className="main-header">
      <nav className="container main-nav">
        <div className="logo">
          <a href="/">
            <img
              src={logoImage}
              alt="LapTechShop Logo"
              className="site-logo-img"
            />
          </a>
        </div>
        <div className="nav-links">
          {(!userInfo || !userInfo.isAdmin) && (
            <Link to="/cart" className="cart-link">
              Giỏ hàng
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </Link>
          )}

          {userInfo ? (
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <Link to="/profile" style={{ fontWeight: "500" }}>
                Chào, {userInfo.name}
              </Link>
              {!userInfo.isAdmin && (
                <Link to="/myorders" style={{ fontWeight: "500" }}>
                  Đơn mua
                </Link>
              )}
              <a
                href="#!"
                onClick={logout}
                style={{ cursor: "pointer", color: "#dc3545" }}
              >
                Đăng xuất
              </a>
            </div>
          ) : (
            <Link to="/login">Đăng nhập</Link>
          )}
        </div>
      </nav>

      {!shouldHideSubNav && (
        <nav className="sub-nav">
          <div className="container sub-nav-content">
            <div className="sub-nav-links">
              {subNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`sub-nav-item ${
                    location.pathname === link.path ? "active" : ""
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* --- FORM TÌM KIẾM & GỢI Ý --- */}
            <div className="search-container" ref={searchRef}>
              <form onSubmit={searchHandler} className="sub-nav-search">
                <input
                  type="text"
                  onChange={(e) => setKeyword(e.target.value)}
                  value={keyword}
                  placeholder="Bạn tìm gì hôm nay?"
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                />
                <button type="submit" className="search-icon-btn">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    width="20"
                    height="20"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </button>
              </form>

              {/* --- DANH SÁCH GỢI Ý (MỚI) --- */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((product) => (
                    <div
                      key={product._id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(product._id)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="suggestion-image"
                      />
                      <div className="suggestion-info">
                        <div className="suggestion-name">{product.name}</div>
                        <div className="suggestion-price">
                          {product.price?.toLocaleString("vi-VN")} ₫
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* ----------------------------- */}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

// --- APP WRAPPER (CHỨA ROUTES) ---
const AppWrapper = () => {
  const navigate = useNavigate();

  return (
    <SearchProvider navigate={navigate}>
      <UserProvider>
        <CartProvider>
          <Header />
          <main className="container">
            <Routes>
              {/* --- Public Routes --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify" element={<VerifyPage />} />

              {/* --- User Routes --- */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/placeorder" element={<PlaceOrderPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/myorders" element={<MyOrdersPage />} />

              {/* --- Admin Routes --- */}
              <Route
                path="/admin/productlist"
                element={<AdminProductListPage />}
              />
              <Route
                path="/admin/product/create"
                element={<AdminCreateProduct />}
              />
              <Route
                path="/admin/product/:id/edit"
                element={<AdminProductEditPage />}
              />
              <Route path="/admin/orderlist" element={<AdminOrderListPage />} />
              <Route path="/admin/keywords" element={<AdminKeywordPage />} />

              {/* --- Static Routes --- */}
              <Route
                path="/solutions"
                element={<div>Trang Giải Pháp (Đang cập nhật)</div>}
              />
              <Route
                path="/services"
                element={<div>Trang Dịch Vụ (Đang cập nhật)</div>}
              />
              <Route
                path="/support"
                element={<div>Trang Hỗ Trợ (Đang cập nhật)</div>}
              />
              <Route
                path="/about"
                element={<div>About LapTechShop Page Content</div>}
              />

              <Route path="*" element={<div>Trang không tìm thấy (404)</div>} />
            </Routes>
          </main>
          <Chatbot />
          <Footer />
        </CartProvider>
      </UserProvider>
    </SearchProvider>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
