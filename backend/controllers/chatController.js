import Product from "../models/Product.model.js"; // <-- 1. IMPORT PRODUCT MODEL

// @desc    Xử lý tin nhắn chat với Gemini AI
// @route   POST /api/chat
// @access  Public

// System Prompt: Định nghĩa vai trò và kiến thức cho AI
const systemPrompt = `
Bạn là một trợ lý AI của LapTechShop, một cửa hàng bán lẻ laptop, desktop, và các thiết bị công nghệ.
Tên của bạn là "LapTech Assistant".
Hãy trả lời các câu hỏi của khách hàng một cách thân thiện, chuyên nghiệp, và hữu ích.

HÃY TUÂN THỦ CÁC QUY TẮC SAU:
1.  **Chuyên môn:** Chỉ trả lời các câu hỏi liên quan đến sản phẩm công nghệ (laptop, desktop, màn hình, v.v.), chính sách của LapTechShop (bảo hành, vận chuyển), hoặc so sánh sản phẩm.
2.  **Từ chối:** Nếu được hỏi về các chủ đề không liên quan (ví dụ: nấu ăn, chính trị, thời tiết), hãy lịch sự từ chối và lái cuộc trò chuyện trở lại chủ đề công nghệ.
3.  **CHỈ DÙNG DỮ LIỆU CUNG CẤP (RAG):** Bạn PHẢI trả lời dựa trên "Context sản phẩm từ database" được cung cấp kèm theo câu hỏi. Đây là dữ liệu sản phẩm thực tế của LapTechShop.
4.  **Không bịa đặt (SỬA ĐỔI):** Nếu "Context" (thông tin từ database) rỗng hoặc không có sản phẩm khớp, hãy trả lời một cách tự nhiên rằng bạn không tìm thấy sản phẩm đó tại LapTechShop và gợi ý họ thử tìm kiếm với từ khóa khác hoặc tham khảo các sản phẩm khác. 
    **QUAN TRỌNG: KHÔNG ĐƯỢC PHÉP dùng câu "Tôi đã kiểm tra trong cơ sở dữ liệu...".**
5.  **Ngắn gọn:** Giữ câu trả lời súc tích.
6.  **Ngôn ngữ:** Luôn trả lời bằng tiếng Việt.
`;

const chatWithAI = async (req, res) => {
  const { prompt } = req.body; // Lấy câu hỏi (prompt) từ người dùng

  if (!prompt) {
    return res.status(400).json({ message: "Vui lòng cung cấp câu hỏi." });
  }

  try {
    // --- 2. (RAG) SỬA LẠI LOGIC TRUY VẤN SẢN PHẨM ---
    let contextText = "";
    try {
      // 1. Tách prompt thành các từ khóa
      const keywords = prompt
        .split(" ")
        .map((word) => word.trim().toLowerCase()) // Chuyển về chữ thường
        .filter((word) => word.length > 2); // Lọc các từ ngắn

      if (keywords.length === 0 && prompt.length > 0) {
        keywords.push(prompt.toLowerCase());
      }

      // --- SỬA LỖI Ở ĐÂY: Thêm trường 'brand' vào $or ---
      // 2. Tạo mảng các điều kiện regex cho MỖI TỪ KHÓA
      const regexConditions = keywords.map((key) => ({
        // Mỗi từ khóa phải xuất hiện trong 1 trong 4 trường này
        $or: [
          { name: { $regex: key, $options: "i" } },
          { description: { $regex: key, $options: "i" } },
          { category: { $regex: key, $options: "i" } },
          { brand: { $regex: key, $options: "i" } }, // <-- THÊM DÒNG NÀY
        ],
      }));
      // --- KẾT THÚC SỬA ---

      // 3. Tạo query: Sản phẩm phải khớp VỚI TẤT CẢ ($and) các từ khóa
      const query = regexConditions.length > 0 ? { $and: regexConditions } : {};

      console.log("Đang tìm kiếm DB với query:", JSON.stringify(query)); // Debug query

      const relevantProducts = await Product.find(query).limit(5); // Lấy 5 sản phẩm

      // --- KẾT THÚC SỬA LOGIC TRUY VẤN ---

      if (relevantProducts.length > 0) {
        // Chuyển danh sách sản phẩm thành text để AI đọc
        contextText =
          "Dưới đây là thông tin các sản phẩm liên quan từ database của LapTechShop:\n\n" +
          relevantProducts
            .map(
              (p) =>
                // Thêm Brand vào context cho AI
                `Sản phẩm: ${p.name}\nHãng: ${
                  p.brand
                }\nGiá: ${p.price.toLocaleString("vi-VN")} ₫\nDanh mục: ${
                  p.category
                }\nMô tả ngắn: ${p.description}\n`
            )
            .join("\n---\n");
      } else {
        contextText =
          "Không có sản phẩm nào trong database của LapTechShop khớp với truy vấn của người dùng.";
      }
    } catch (dbError) {
      console.error("Lỗi khi tìm kiếm sản phẩm trong DB:", dbError);
      contextText = "Đã xảy ra lỗi khi tra cứu cơ sở dữ liệu sản phẩm.";
    }
    // --- KẾT THÚC RAG ---

    // Lấy API Key từ file .env
    const apiKey = process.env.GEMINI_API_KEY;

    // Đảm bảo URL là đúng
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    // --- 3. SỬA PAYLOAD ---
    const payload = {
      contents: [
        {
          parts: [
            {
              // Gửi cả Context (lấy từ DB) và Câu hỏi (Prompt)
              text: `Context sản phẩm từ database:\n${contextText}\n\nCâu hỏi của người dùng:\n${prompt}`,
            },
          ],
        },
      ],
      // --- 4. TẮT GOOGLE SEARCH (Giữ nguyên) ---

      // Gửi hướng dẫn hệ thống
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
    };
    // --- KẾT THÚC SỬA PAYLOAD ---

    // Thực hiện gọi API đến Gemini
    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error("Gemini API Error:", errorData);
      throw new Error(
        `Gemini API request failed with status ${apiResponse.status}`
      );
    }

    const result = await apiResponse.json();

    // Lấy câu trả lời (text) từ AI
    const candidate = result.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (text) {
      res.json({ reply: text }); // Trả về câu trả lời cho Frontend
    } else {
      console.error(
        "No text response from Gemini:",
        JSON.stringify(result, null, 2)
      );
      res.status(500).json({ message: "AI không thể tạo câu trả lời." });
    }
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi kết nối với AI." });
  }
};

export { chatWithAI };
