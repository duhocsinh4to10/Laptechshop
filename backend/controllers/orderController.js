import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import moment from "moment"; // Thư viện xử lý ngày giờ
import querystring from "qs"; // Thư viện xử lý query string
import crypto from "crypto"; // Thư viện mã hóa (có sẵn trong Node.js)

// --- CẤU HÌNH VNPAY (SANDBOX/TEST) ---
// BẠN CẦN THAY THẾ 2 GIÁ TRỊ DƯỚI ĐÂY BẰNG THÔNG TIN TỪ EMAIL VNPAY GỬI VỀ
const vnp_TmnCode = "90MOH9KR";
const vnp_HashSecret = "NXWDFATCIB40HWN9C6YUGECEVZTUC5DQ"; // Ví dụ: YOUR_HASH_SECRET_KEY
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "http://localhost:3000/order-success"; // URL quay lại sau khi thanh toán
// @desc    Tạo đơn hàng mới
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    // --- LOG DEBUG: Kiểm tra dữ liệu nhận được ---
    console.log("--- YÊU CẦU TẠO ĐƠN HÀNG ---");
    console.log("User ID:", req.user._id);
    console.log("Sản phẩm:", orderItems?.length);
    console.log("Phương thức:", paymentMethod);
    // --------------------------------------

    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm nào trong giỏ hàng" });
    }

    // Chuẩn hóa danh sách sản phẩm (Fix lỗi thiếu dữ liệu/sai kiểu)
    const sanitizedOrderItems = orderItems.map((item) => {
      // Xác định ID sản phẩm
      const productId = item.product || item._id;

      if (!productId) {
        throw new Error(
          `Sản phẩm "${item.name}" bị thiếu ID. Vui lòng xóa khỏi giỏ và thêm lại.`
        );
      }

      return {
        name: item.name || "Sản phẩm không tên",
        qty: Number(item.qty) || 1,
        image: item.image || "/images/sample.jpg",
        price: Number(item.price) || 0,
        product: productId,
        _id: undefined,
      };
    });

    const order = new Order({
      user: req.user._id,
      orderItems: sanitizedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: Number(itemsPrice) || 0,
      shippingPrice: Number(shippingPrice) || 0,
      totalPrice: Number(totalPrice) || 0,
      status: "PENDING",
      isPaid: false, // Mặc định là chưa thanh toán, sẽ cập nhật sau khi VNPay trả về
      paidAt: null,
    });

    const createdOrder = await order.save();

    console.log("Order created successfully:", createdOrder._id);

    // Cập nhật tồn kho
    for (const item of createdOrder.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock = Math.max(0, product.countInStock - item.qty);
        product.sold = (product.sold || 0) + item.qty;
        await product.save();
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("SERVER ERROR in addOrderItems:", error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi tạo đơn hàng: " + error.message });
  }
};

// --- HÀM TẠO URL THANH TOÁN VNPAY ---
// @desc    Tạo URL thanh toán VNPay cho đơn hàng
// @route   POST /api/orders/create_payment_url
const createVnpayUrl = async (req, res) => {
  // Lấy dữ liệu từ request body
  const { orderId, amount, bankCode, language } = req.body;
  
  // 1. Lấy IP Address
  let ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

  // 2. Cấu hình ngày tháng (Dùng moment thay cho dateformat)
  // process.env.TZ = 'Asia/Ho_Chi_Minh'; // Có thể bỏ nếu server đã đúng múi giờ
  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  
  // 3. Cấu hình các tham số VNPay
  let vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = vnp_TmnCode;
  vnp_Params['vnp_Locale'] = language || 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId; // Mã đơn hàng (Dùng ID từ DB làm mã giao dịch)
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang ' + orderId;
  vnp_Params['vnp_OrderType'] = 'other'; // Loại hàng hóa: khác
  vnp_Params['vnp_Amount'] = amount * 100; // Số tiền (VNĐ * 100)
  vnp_Params['vnp_ReturnUrl'] = vnp_ReturnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;

  if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
  }

  // 4. Sắp xếp tham số (Bắt buộc để tạo checksum đúng)
  vnp_Params = sortObject(vnp_Params);

  // 5. Tạo chữ ký bảo mật (Secure Hash)
  const signData = querystring.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
  
  vnp_Params['vnp_SecureHash'] = signed;
  
  // 6. Tạo URL cuối cùng
  const paymentUrl = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

  // Trả về URL cho Frontend để redirect
  res.json({ vnpUrl: paymentUrl });
};

// Hàm sắp xếp tham số (Giữ nguyên từ demo)
function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// @desc    Lấy danh sách đơn hàng CỦA TÔI
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// @desc    Lấy tất cả đơn hàng (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "id name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// @desc    Cập nhật trạng thái đơn hàng (Admin)
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;

      // Tự động cập nhật các mốc thời gian
      if (status === "PAID") {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
      if (status === "SHIPPING") {
        // Có thể thêm logic gửi email thông báo tại đây
      }
      if (status === "COMPLETED") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        // Nếu COD thì giao xong mới tính là đã trả tiền
        if (!order.isPaid) {
          order.isPaid = true;
          order.paidAt = Date.now();
        }
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
  }
};
const getOrderStats = async (req, res) => {
  try {
    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    // 1. Tổng doanh thu & Tổng đơn hàng (Chỉ tính đơn đã thanh toán/hoàn thành)
    // Lưu ý: Tùy logic của bạn mà chọn 'isPaid' hoặc 'status === COMPLETED'
    const totalOrders = await Order.countDocuments({});

    const paidOrders = await Order.find({ isPaid: true });
    const totalRevenue = paidOrders.reduce(
      (acc, order) => acc + (order.totalPrice || 0),
      0
    );

    // 2. Doanh thu tháng này
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const monthOrders = await Order.find({
      isPaid: true,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const monthlyRevenue = monthOrders.reduce(
      (acc, order) => acc + (order.totalPrice || 0),
      0
    );

    // 3. Doanh thu hôm nay
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayOrders = await Order.find({
      isPaid: true,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    const dailyRevenue = todayOrders.reduce(
      (acc, order) => acc + (order.totalPrice || 0),
      0
    );

    // 4. Dữ liệu biểu đồ (Doanh thu theo từng ngày trong tháng hiện tại)
    // Aggregation Pipeline của MongoDB
    const dailyStats = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" }, // Nhóm theo ngày
          totalSales: { $sum: "$totalPrice" }, // Tổng tiền
          count: { $sum: 1 }, // Số đơn
        },
      },
      { $sort: { _id: 1 } }, // Sắp xếp theo ngày tăng dần
    ]);

    // Chuẩn hóa dữ liệu biểu đồ (điền 0 cho những ngày không có đơn)
    const chartData = [];
    const daysInMonth = endOfMonth.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStat = dailyStats.find((d) => d._id === i);
      chartData.push({
        day: i,
        sales: dayStat ? dayStat.totalSales : 0,
        orders: dayStat ? dayStat.count : 0,
      });
    }

    res.json({
      totalOrders,
      totalRevenue,
      monthlyRevenue,
      dailyRevenue,
      chartData,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Lỗi server khi lấy thống kê" });
  }
};
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Kiểm tra quyền sở hữu: Phải là đơn của user đó
      if (order.user.toString() !== req.user._id.toString()) {
        return res
          .status(401)
          .json({ message: "Không có quyền hủy đơn hàng này" });
      }

      // Kiểm tra trạng thái: Chỉ được hủy nếu chưa vận chuyển (PENDING hoặc PAID)
      if (order.status === "PENDING" || order.status === "PAID") {
        order.status = "CANCELLED";
        // Nếu đã thanh toán rồi mà hủy, có thể cần logic hoàn tiền ở đây (hoặc thông báo admin)

        // Quan trọng: Hoàn lại số lượng tồn kho (nếu cần thiết)
        // for (const item of order.orderItems) {
        //    const product = await Product.findById(item.product);
        //    if (product) {
        //        product.countInStock += item.qty;
        //        product.sold -= item.qty;
        //        await product.save();
        //    }
        // }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
      } else {
        res.status(400).json({
          message: "Không thể hủy đơn hàng khi đã vận chuyển hoặc hoàn thành.",
        });
      }
    } else {
      res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi hủy đơn hàng" });
  }
};

export {
  addOrderItems,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  createVnpayUrl,
  getOrderStats,
  cancelOrder,
};
