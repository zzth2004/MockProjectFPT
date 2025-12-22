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

  // 3️⃣ Xem gói cước hiện tại của bản thân (Người dùng đang đăng nhập)
  getMySubscription: async () => {
    return axiosClient.get("/subscriptions/me").then(res => res.data.data);
  }
};

export default subscriptionService;