import React from "react";
import { Link } from "react-router-dom";
import Rating from "./Rating.js";
import "./ProductCard.css"; // Sẽ tạo CSS bên dưới

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="product-card-img"
        />
      </Link>
      <div className="product-info">
        <Link to={`/product/${product._id}`} className="product-name-link">
          <h3>{product.name}</h3>
        </Link>

        {product.numReviews > 0 && (
          <div className="product-card-rating">
            <Rating value={product.rating} text={`(${product.numReviews})`} />
          </div>
        )}

        <div className="product-card-bottom">
          <p className="product-price">
            {product.price.toLocaleString("vi-VN")} ₫
          </p>
          {product.sold > 0 && (
            <p className="product-sold">Đã bán: {product.sold}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
