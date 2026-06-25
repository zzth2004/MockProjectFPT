import axiosClient from "../../../../api/axiosAPI";

const ticketService = {
  // Lấy toàn bộ ticket của hệ thống (Admin)
  getAll: async () => {
    return axiosClient.get("/support/admin/all").then((res) => res.data.data);
  },

  // Xem chi tiết hội thoại của ticket (User / Admin)
  getDetail: async (id) => {
    return axiosClient.get(`/support/ticket/${id}`).then((res) => res.data.data);
  },

  // Trả lời ticket (User hoặc Admin)
  reply: async (id, messageText, attachment = null) => {
    return axiosClient
      .post(`/support/ticket/${id}/reply`, { messageText, attachment })
      .then((res) => res.data.data);
  },

  // Cập nhật trạng thái đóng/mở ticket (Admin)
  updateStatus: async (id, status) => {
    return axiosClient
      .patch(`/support/admin/ticket/${id}/status`, { status })
      .then((res) => res.data.data);
  },

  // Tải tệp đính kèm lên server hỗ trợ
  uploadAttachment: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient
      .post("/support/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
};

export default ticketService;
