import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../App.js";
import "./AdminListPage.css"; // Dùng chung CSS Admin

const AdminKeywordPage = () => {
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const { userInfo } = useUser();

  const fetchKeywords = async () => {
    const { data } = await axios.get("http://localhost:5000/api/keywords");
    setKeywords(data);
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newKeyword) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post(
        "http://localhost:5000/api/keywords",
        { text: newKeyword },
        config
      );
      setNewKeyword("");
      fetchKeywords();
    } catch (error) {
      alert("Lỗi khi thêm");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa từ khóa này?")) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        await axios.delete(`http://localhost:5000/api/keywords/${id}`, config);
        fetchKeywords();
      } catch (error) {
        alert("Lỗi khi xóa");
      }
    }
  };

  return (
    <div
      className="admin-list-container"
      style={{ maxWidth: "600px", margin: "auto" }}
    >
      <h1>Quản Lý Từ Khóa Hot</h1>

      <form
        onSubmit={handleAdd}
        style={{ display: "flex", gap: "10px", marginBottom: "2rem" }}
      >
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Nhập từ khóa (vd: iPhone 15, Gaming Mouse...)"
          style={{
            padding: "0.5rem",
            flex: 1,
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        />
        <button type="submit" className="admin-add-btn">
          Thêm
        </button>
      </form>

      <table className="admin-list-table">
        <thead>
          <tr>
            <th>Từ Khóa</th>
            <th style={{ width: "80px" }}>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {keywords.map((k) => (
            <tr key={k._id}>
              <td>{k.text}</td>
              <td>
                <button
                  onClick={() => handleDelete(k._id)}
                  className="admin-delete-btn"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminKeywordPage;
