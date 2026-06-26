import axiosClient from "../../../../api/axiosAPI";

/**
 * Order Service - Quản lý Đơn hàng hệ thống
 */
const orderService = {
  // Lấy tất cả đơn hàng hệ thống (Admin)
  getAllOrders: async (page = 1, limit = 10, search = "") => {
    return axiosClient.get("/orders/admin/all", {
      params: { page, limit, search }
    }).then(res => res.data.data);
  },

  // Tạo đơn hàng mới (Checkout)
  createOrder: async (data) => {
    return axiosClient.post("/orders/checkout", data).then(res => res.data.data);
  },

  // Giả lập thanh toán thành công (Admin / Webhook mock)
  completeOrder: async (id) => {
    return axiosClient.patch(`/orders/${id}/complete`).then(res => res.data.data);
  },

  // Tạo đơn hàng mới (Checkout)
  checkout: async (data) => {
    return axiosClient.post("/orders/checkout", data).then(res => res.data.data || res.data);
  },

  // Giả lập thanh toán qua Webhook tự động (Casso/PayOS mock)
  simulatePayment: async (orderCode, amount) => {
    return axiosClient.post("/orders/webhook/bank-transfer", { orderCode, amount }).then(res => res.data);
  }
};

export default orderService;
