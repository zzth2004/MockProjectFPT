import axiosClient from "../../../../api/axiosAPI";

const couponService = {
  // Lấy toàn bộ mã giảm giá (Admin)
  getAll: async () => {
    return axiosClient.get("/coupons/admin/all").then((res) => res.data.data);
  },

  // Tạo mã giảm giá mới (Admin)
  create: async (data) => {
    return axiosClient.post("/coupons", data).then((res) => res.data.data);
  },

  // Bật/Tắt hoạt động của mã giảm giá (Admin)
  updateStatus: async (id, isActive) => {
    return axiosClient
      .patch(`/coupons/admin/${id}/status`, { isActive })
      .then((res) => res.data.data);
  },

  // Lấy lịch sử sử dụng mã giảm giá của học viên (Admin)
  getUsages: async (page = 1, limit = 10, search = "") => {
    return axiosClient
      .get("/coupons/admin/usages", { params: { page, limit, search } })
      .then((res) => res.data.data);
  }
};

export default couponService;
