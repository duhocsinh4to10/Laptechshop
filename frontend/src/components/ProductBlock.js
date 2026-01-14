import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard.js";
import "./ProductBlock.css";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles (Bắt buộc)
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import modules cần thiết (Navigation mũi tên, Pagination dấu chấm)
import { Navigation, Pagination, Autoplay } from "swiper/modules";

const ProductBlock = ({ title, category, limit = 8, filterType = "trend" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockProducts = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/products?category=${category}&limit=${limit}&filterType=${filterType}`
        );
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải Product Block:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockProducts();
  }, [category, limit, filterType]);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <div className="product-block-container">
      <div className="product-block-header">
        <h2>{title}</h2>
      </div>

      {/* --- SWIPER SLIDER --- */}
      <div className="product-block-slider">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20} // Khoảng cách giữa các thẻ
          slidesPerView={1} // Mặc định mobile 1 thẻ
          navigation // Hiển thị mũi tên trái/phải
          // pagination={{ clickable: true }} // Dấu chấm tròn bên dưới (tùy chọn)
          autoplay={{ delay: 5000, disableOnInteraction: false }} // Tự động chạy sau 5s
          breakpoints={{
            // Khi màn hình >= 640px
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            // Khi màn hình >= 768px
            768: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            // Khi màn hình >= 1024px (Desktop)
            1024: {
              slidesPerView: 4, // Hiện 4 sản phẩm
              spaceBetween: 30,
            },
          }}
          className="mySwiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              {/* Lưu ý: SwiperSlide cần content có height cố định hoặc flex để đều nhau.
                 ProductCard đã được style height: 100% nên sẽ ổn.
               */}
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* --- KẾT THÚC SWIPER --- */}
    </div>
  );
};

export default ProductBlock;
