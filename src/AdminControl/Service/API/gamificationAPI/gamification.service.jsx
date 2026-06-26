import axiosClient from "../../../../api/axiosAPI";

const gamificationService = {
  // 🏆 Lấy Bảng Xếp Hạng (Top Users)
  getLeaderboard: async (limit = 10) => {
    return axiosClient.get("/gamification/leaderboard", { params: { limit } })
      .then(res => res.data.data || res.data);
  },

  // 📈 Lấy thống kê của tôi (tổng điểm, streak, level)
  getMyStats: async () => {
    return axiosClient.get("/gamification/stats/me")
      .then(res => res.data.data || res.data);
  },

  // 🕒 Lấy lịch sử biến động điểm
  getMyHistory: async (page = 1) => {
    return axiosClient.get("/gamification/transactions/me", { params: { page } })
      .then(res => res.data.data || res.data);
  },

  // 🏅 Xem tất cả huy hiệu trong hệ thống
  getAllBadges: async () => {
    return axiosClient.get("/gamification/badges/all")
      .then(res => res.data.data);
  },

  // 🎖️ Tạo huy hiệu mới (Admin)
  createBadge: async (data) => {
    return axiosClient.post("/gamification/badges", data)
      .then(res => res.data.data);
  },

  // 💝 Tặng huy hiệu cho học viên thủ công (Admin)
  awardBadge: async (userId, badgeId) => {
    return axiosClient.post(`/gamification/users/${userId}/award-badge/${badgeId}`)
      .then(res => res.data.data);
  },

  // ⚡ Cộng điểm thủ công (Admin)
  addPoints: async (userId, data) => {
    return axiosClient.post(`/gamification/users/${userId}/add-points`, data)
      .then(res => res.data.data);
  }
};

export default gamificationService;
