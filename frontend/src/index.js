import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google"; // <-- IMPORT
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Lấy Client ID bạn vừa tạo từ Google Cloud Console
const GOOGLE_CLIENT_ID =
  "699339538743-r3gq0aqjb52g6ka4i7s4g5reipbn17l4.apps.googleusercontent.com";

root.render(
  <React.StrictMode>
    {/* BỌC ỨNG DỤNG CỦA BẠN */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
