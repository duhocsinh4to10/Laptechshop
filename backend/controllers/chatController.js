import Product from "../models/Product.model.js";

// --- PROMPT 1: Dùng để sinh ra MongoDB Query Object ---
const SCHEMA_DESCRIPTION = `
Bạn là một AI chuyển đổi ngôn ngữ tự nhiên thành câu truy vấn MongoDB (Mongoose).
Dưới đây là thông tin Schema của bảng 'products':
- name (String): Tên sản phẩm.
- description (String): Mô tả cấu hình.
- brand (String): Thương hiệu.
- category (String): Loại sản phẩm.
- price (Number): Giá sản phẩm (VNĐ).
- countInStock (Number): Số lượng tồn kho.

YÊU CẦU: Chỉ trả về duy nhất chuỗi JSON hợp lệ. Không giải thích.
`;

const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Chưa cấu hình GEMINI_API_KEY");

  // Sử dụng gemini-1.5-flash hoặc gemini-2.0-flash-exp (ổn định hơn v2.5)
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1 }, // Để thấp để kết quả query chính xác hơn
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const chatWithAI = async (req, res) => {
  const { prompt, history = [] } = req.body;
  if (!prompt) return res.status(400).json({ message: "Vui lòng cung cấp câu hỏi." });

  try {
    // --- BƯỚC 1: LẤY MONGODB QUERY ---
    const queryPrompt = `${SCHEMA_DESCRIPTION}\n\nCâu hỏi người dùng: "${prompt}"`;
    let rawQuery = await callGemini(queryPrompt);
    rawQuery = rawQuery.replace(/```json/g, "").replace(/```/g, "").trim();

    let dbResults = [];
    let isGeneralChat = false;

    // --- BƯỚC 2: THỰC THI QUERY ---
    try {
        if (!rawQuery || rawQuery === "{}" || rawQuery.includes("Error")) {
            isGeneralChat = true;
        } else {
            const mongoQuery = JSON.parse(rawQuery);
            dbResults = await Product.find(mongoQuery).limit(5).lean();
            if (dbResults.length === 0) isGeneralChat = false; // Vẫn để AI xử lý khi không có KQ
        }
    } catch (e) {
        isGeneralChat = true;
    }

    // --- BƯỚC 3: TẠO CÂU TRẢ LỜI CUỐI CÙNG VỚI FORMAT ĐẸP ---
    let finalSystemPrompt = "";

    if (isGeneralChat && dbResults.length === 0 && !rawQuery.includes("{")) {
        finalSystemPrompt = `
        Bạn là trợ lý ảo LapTech Assistant. Hãy trả lời câu hỏi xã giao này: "${prompt}".
        Hãy giữ phong thái chuyên nghiệp và thân thiện của một cửa hàng công nghệ.
        `;
    } else {
        const resultString = dbResults.length > 0
            ? JSON.stringify(dbResults.map(p => ({
                name: p.name,
                brand: p.brand,
                price: p.price.toLocaleString('vi-VN') + ' ₫',
                desc: p.description,
                stock: p.countInStock
              })))
            : "KHÔNG TÌM THẤY SẢN PHẨM NÀO.";

        finalSystemPrompt = `
        Bạn là chuyên gia tư vấn bán hàng tại LapTechShop.
        Dựa trên dữ liệu sau: ${resultString}

        Hãy trả lời khách hàng về câu hỏi: "${prompt}" theo định dạng sau:
        1. Mở đầu thân thiện.
        2. Mỗi sản phẩm trình bày theo format:
           ### 💻 [Tên sản phẩm]
           * **Giá bán:** [Giá]
           * **Thương hiệu:** [Hãng]
           * **Cấu hình:** [Mô tả]
           * **Tình trạng:** [Còn hàng/Hết hàng]
        3. Dùng đường kẻ ngang "---" để ngăn cách GIỮA các sản phẩm.
        4. Kết luận chuyên nghiệp.

        Lưu ý: Nếu không thấy sản phẩm, hãy xin lỗi và gợi ý khách tìm từ khóa khác.
        `;
    }

    const finalReply = await callGemini(finalSystemPrompt);
    res.json({ reply: finalReply });

  } catch (error) {
    console.error("System Error:", error);
    res.status(500).json({ message: "Hệ thống đang bận, vui lòng thử lại sau." });
  }
};

export { chatWithAI };