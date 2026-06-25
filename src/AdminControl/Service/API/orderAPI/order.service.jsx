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

  // Giả lập thanh toán thành công (Admin / Webhook mock)
  completeOrder: async (id) => {
    return axiosClient.patch(`/orders/${id}/complete`).then(res => res.data.data);
  }
};

export default orderService;
