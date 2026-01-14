import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  // --- STATE QUẢN LÝ (Giữ nguyên) ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Chào bạn! Tôi là Trợ lý Ảo LapTechShop. Tôi có thể giúp gì cho bạn?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // --- HÀM XỬ LÝ (Giữ nguyên) ---
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // --- HÀM SUBMIT (Giữ nguyên logic API) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        "http://localhost:5000/api/chat",
        { prompt: userMessage.text },
        config
      );
      const botMessage = { from: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi khi gọi API Chatbot:", error);
      const errorMessage = {
        from: "bot",
        text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* --- CỬA SỔ CHAT (Giữ nguyên) --- */}
      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        {/* Header cửa sổ chat */}
        <div className="chat-header">
          <h3>Trợ lý Ảo LapTechShop</h3>
          <button onClick={toggleChat} className="chat-close-btn">
            &times;
          </button>
        </div>

        {/* Nơi hiển thị các tin nhắn */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.from}`}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="message bot loading">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Form nhập tin nhắn */}
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi của bạn..."
            disabled={loading}
          />
          {/* --- SỬA LỖI Ở ĐÂY --- */}
          {/* Sửa typeD="submit" thành type="submit" */}
          <button type="submit" disabled={loading}>
            {/* --- KẾT THÚC SỬA --- */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="20"
              height="20"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.941L21.53 12.75a.75.75 0 0 0 0-1.498L3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>

      {/* --- BONG BÓNG CHAT (Giữ nguyên) --- */}
      <button className="chat-bubble" onClick={toggleChat}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="30"
          height="30"
        >
          <path
            fillRule="evenodd"
            d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.75 6.75 0 0 0 6.75-6.75v-2.5a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v2.5a6.75 6.75 0 0 0 6.75 6.75c.21 0 .416-.01.62-.027a.75.75 0 0 1 .727.818A8.25 8.25 0 0 1 18.75 24a8.25 8.25 0 0 1-8.25-8.25v-2.5a.75.75 0 0 0-.75-.75h-.75a.75.75 0 0 0-.75.75v2.5A8.25 8.25 0 0 1 0 21.75a8.23 8.23 0 0 1 .42-2.341a.75.75 0 0 1 .818.727c.01.203.02.406.027.61Z"
            clipRule="evenodd"
          />
          <path d="M10.749 6.22A5.23 5.23 0 0 1 12 6a5.25 5.25 0 0 1 5.25 5.25c0 .642-.12 1.261-.34 1.834a.75.75 0 0 0 .49.9a6.74 6.74 0 0 1 1.859 2.11c.23.41.025.91-.386 1.139a.75.75 0 0 0-.386-1.14 5.247 5.247 0 0 0-1.5-1.76.75.75 0 0 0-.962.34c-.23.411-.74.69-1.28.69h-.75a.75.75 0 0 1-.75-.75V12a.75.75 0 0 0-.75-.75h-.75a.75.75 0 0 0-.75.75v.75c0 .54.28.97.69 1.28a.75.75 0 0 0 .34.962 5.247 5.247 0 0 0-1.76 1.5.75.75 0 1 0 1.14.386 6.74 6.74 0 0 1 2.11-1.859a.75.75 0 0 0 .9-.49A5.23 5.23 0 0 1 6.75 12a5.25 5.25 0 0 1 5.25-5.25c.642 0 1.261.12 1.834.34a.75.75 0 0 0 .9-.49 6.74 6.74 0 0 1 2.11-1.859.75.75 0 1 0-.386-1.14 5.247 5.247 0 0 0-1.5 1.76.75.75 0 0 0-.962-.34Z" />
        </svg>
      </button>
    </div>
  );
};

export default Chatbot;
