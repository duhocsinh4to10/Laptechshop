import React from "react";

// --- Component để hiển thị Rating (Sao) ---
// Component này được sao chép từ ProductPage.js để tái sử dụng
const Rating = ({ value, text }) => {
  return (
    <div className="rating">
      {/* Sao 1 */}
      <span>
        <i
          style={{ color: "#ffc107" }} // Màu vàng (thay #f8e825)
          className={
            value >= 1
              ? "fas fa-star" // Sao đầy
              : value >= 0.5
              ? "fas fa-star-half-alt" // Nửa sao
              : "far fa-star" // Sao rỗng
          }
        ></i>
      </span>
      {/* Sao 2 */}
      <span>
        <i
          style={{ color: "#ffc107" }}
          className={
            value >= 2
              ? "fas fa-star"
              : value >= 1.5
              ? "fas fa-star-half-alt"
              : "far fa-star"
          }
        ></i>
      </span>
      {/* Sao 3 */}
      <span>
        <i
          style={{ color: "#ffc107" }}
          className={
            value >= 3
              ? "fas fa-star"
              : value >= 2.5
              ? "fas fa-star-half-alt"
              : "far fa-star"
          }
        ></i>
      </span>
      {/* Sao 4 */}
      <span>
        <i
          style={{ color: "#ffc107" }}
          className={
            value >= 4
              ? "fas fa-star"
              : value >= 3.5
              ? "fas fa-star-half-alt"
              : "far fa-star"
          }
        ></i>
      </span>
      {/* Sao 5 */}
      <span>
        <i
          style={{ color: "#ffc107" }}
          className={
            value >= 5
              ? "fas fa-star"
              : value >= 4.5
              ? "fas fa-star-half-alt"
              : "far fa-star"
          }
        ></i>
      </span>
      {/* Text (ví dụ: "(5 đánh giá)") */}
      <span className="rating-text">{text && text}</span>
    </div>
  );
};
// --- Hết component Rating ---

export default Rating;
