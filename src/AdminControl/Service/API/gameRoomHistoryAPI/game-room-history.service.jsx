import axiosClient from "../../../../api/axiosAPI";

/**
 * Game Room History Service - Quản lý lịch sử và bảng xếp hạng đấu quiz
 */
const gameRoomHistoryService = {
  // Lấy danh sách lịch sử đấu
  getHistory: async (page = 1, limit = 10) => {
    return axiosClient.get("/game-rooms/history", {
      params: { page, limit }
    }).then(res => res.data.data);
  },

  // Lấy bảng điểm chi tiết của phòng đấu
  getRoomLeaderboard: async (roomId) => {
    return axiosClient.get(`/game-rooms/history/${roomId}/leaderboard`).then(res => res.data.data);
  },

  // Lấy bảng xếp hạng số trận thắng (Win count) toàn hệ thống
  getGlobalWinners: async (page = 1, limit = 10) => {
    return axiosClient.get("/game-rooms/leaderboard/winners", {
      params: { page, limit }
    }).then(res => res.data.data);
  }
};

export default gameRoomHistoryService;
