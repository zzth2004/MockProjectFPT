import axiosClient from "../../../../api/axiosAPI";

/**
 * Subscription Service - Quản lý Gói cước và Đăng ký học viên
 */
const subscriptionService = {

  // 1️⃣ Lấy danh sách tất cả gói cước (Public - Học viên dùng để chọn gói)
  getPlans: async () => {
    return axiosClient.get("/subscriptions/plans").then(res => res.data.data);
  },

  // 2️⃣ Tạo gói cước mới (Admin)
  createPlan: async (data) => {
    return axiosClient.post("/subscriptions/plans", data).then(res => res.data.data);
  },

  // Cập nhật gói cước (Admin)
  updatePlan: async (id, data) => {
    return axiosClient.patch(`/subscriptions/plans/${id}`, data).then(res => res.data.data);
  },

  // Xóa gói cước (Admin)
  deletePlan: async (id) => {
    return axiosClient.delete(`/subscriptions/plans/${id}`).then(res => res.data.data);
  },

  // Lấy tất cả lịch sử đăng ký của học viên (Admin)
  adminGetAllSubscriptions: async (page = 1, limit = 10, search = "") => {
    return axiosClient.get("/subscriptions/admin/all", {
      params: { page, limit, search }
    }).then(res => res.data.data);
  },

  // Cập nhật trạng thái đăng ký học viên (Admin)
  adminUpdateSubscriptionStatus: async (id, status, endDate) => {
    return axiosClient.patch(`/subscriptions/admin/${id}/status`, { status, endDate }).then(res => res.data.data);
  },

  // 3️⃣ Xem gói cước hiện tại của bản thân (Người dùng đang đăng nhập)
  getMySubscription: async () => {
    return axiosClient.get("/subscriptions/me").then(res => res.data.data);
  }
};

export default subscriptionService;