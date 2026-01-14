import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Nếu có file này, nếu không hãy tạo file rỗng hoặc xóa dòng này
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
