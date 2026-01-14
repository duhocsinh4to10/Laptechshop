import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    // 1. Tạo transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Email của bạn từ .env
        pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng từ .env
      },
    });

    // 2. Cấu hình nội dung email
    const mailOptions = {
      from: `"LapTechShop" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };

    // 3. Gửi email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

// Hàm gửi email xác thực OTP
export const sendVerificationEmail = async (email, otp) => {
  const subject = "Xác thực tài khoản LapTechShop của bạn";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Chào mừng bạn đến với LapTechShop!</h2>
      <p>Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã OTP dưới đây để hoàn tất đăng ký:</p>
      <h1 style="color: #ff6600; font-size: 36px; text-align: center; letter-spacing: 5px;">
        ${otp}
      </h1>
      <p>Mã này sẽ hết hạn sau 10 phút.</p>
      <p>Nếu bạn không đăng ký, vui lòng bỏ qua email này.</p>
    </div>
  `;

  await sendEmail(email, subject, html);
};
