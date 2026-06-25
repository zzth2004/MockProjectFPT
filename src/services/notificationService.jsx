import axiosClient from "../api/axiosAPI.jsx";

const notificationService = {
  // Lấy danh sách thông báo của tôi (Có phân trang)
  getMyNotifications: async (page = 1, limit = 50) => {
    return axiosClient
      .get("/notifications/me", { params: { page, limit } })
      .then((res) => res.data);
  },

  // Đếm số lượng thông báo chưa đọc
  getUnreadCount: async () => {
    return axiosClient
      .get("/notifications/me/unread-count")
      .then((res) => res.data);
  },

  // Đánh dấu 1 thông báo cụ thể là đã đọc
  markAsRead: async (id) => {
    return axiosClient
      .patch(`/notifications/${id}/read`)
      .then((res) => res.data);
  },

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: async () => {
    return axiosClient
      .patch("/notifications/read-all")
      .then((res) => res.data);
  },
};

export default notificationService;
