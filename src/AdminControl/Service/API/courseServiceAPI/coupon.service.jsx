import axiosClient from "../../../../api/axiosAPI";

const couponService = {
  checkCoupon: async (code, orderTotal) => {
    try {
      const response = await axiosClient.post("/coupons/check", { code, orderTotal });
      return response.data.data || response.data; // Unwrap NestJS { status, data: { ... } }
    } catch (error) {
      // Return a consistent format even on error
      return {
        valid: false,
        message: error.response?.data?.message || "Lỗi kiểm tra mã giảm giá."
      };
    }
  }
};

export default couponService;
