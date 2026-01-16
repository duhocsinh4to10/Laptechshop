// Chatbot.js đã được nâng cấp hỗ trợ Markdown
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown"; // Import thư viện Markdown
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Chào bạn! Tôi là Trợ lý Ảo LapTechShop. Tôi có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:5000/api/chat", {
        prompt: input,
        history: messages // Gửi kèm lịch sử để bot thông minh hơn
      });

      setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { from: "bot", text: "Xin lỗi, hệ thống đang bận." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <h3>Trợ lý LapTechShop</h3>
          <button onClick={toggleChat}>&times;</button>
        </div>
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.from}`}>
              {/* Nếu là bot thì render Markdown, nếu là user thì hiện text thường */}
              {msg.from === "bot" ? (
                <div className="markdown-content">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          ))}
          {loading && <div className="loading"><span></span><span></span><span></span></div>}
          <div ref={messagesEndRef} />
        </div>
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Hỏi về laptop..." 
          />
          <button type="submit" disabled={loading}>Gửi</button>
        </form>
      </div>
      <button className="chat-bubble" onClick={toggleChat}>💬</button>
    </div>
  );
};

export default Chatbot;