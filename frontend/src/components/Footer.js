import React from "react";
import "./Footer.css"; // Chúng ta sẽ tạo file này ở Bước 2

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="container footer-content">
        {/* Chúng ta bỏ tên công ty và mã số thuế theo yêu cầu */}
        <p>
          <strong>Địa chỉ:</strong> 73 Phùng Khoang, Trung Văn, Nam Từ Liêm, Hà
          Nội
        </p>
        <p>
          <strong>Hotline (Góp ý & Khiếu nại):</strong> 0343.543.795
        </p>
        {/* Thêm các thông tin khác (giống ảnh mẫu) làm placeholder */}
        <p>
          <strong>Email:</strong> info@laptechshop.com (placeholder) |
          <strong>Website:</strong> www.laptechshop.com (placeholder)
        </p>
        <p className="footer-copyright">
          © {new Date().getFullYear()} LapTechShop. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
