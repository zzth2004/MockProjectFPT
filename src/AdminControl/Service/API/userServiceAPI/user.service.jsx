// src/Service/API/userServiceAPI/user.service.js
import axiosClient from "../../../../api/axiosAPI";

const userService = {
  /**
   * 📊 Lấy số liệu thống kê cho Dashboard (Admin Only)
   */
  getAdminStats: async () => {
    console.log("🚀 [Service] Calling: getAdminStats");
    return axiosClient.get("/users/stats")
      .then(res => {
        console.log("✅ [Service] Stats Response:", res.data); // In ra để debug
        return res.data.data; // Trả về thẳng cục { totalUsers, totalStudents, ... }
      });
  },

  /**
   * 🔵 Lấy danh sách học sinh (Phân trang)
   */
  getStudents: async (page = 1, limit = 10) => {
    console.log(`🚀 [Service] Calling: getStudents (Page: ${page})`);
    return axiosClient.get(`/users/students`, { params: { page, limit } })
      .then(res => {
        console.log("✅ [Service] Students List:", res.data?.data);
        return res.data.data; // Trả về { items: [], meta: {} }
      });
  },

  /**
   * 👤 Lấy profile của chính mình
   */
  getMyProfile: async () => {
    return axiosClient.get("/users/me")
      .then(res => {
        console.log("✅ [Service] My Profile:", res.data);
        return res.data.data;
      });
  },

  getAllUsers: (page = 1, limit = 10) => {
    return axiosClient.get(`/users/allusers`, { params: { page, limit } })
      .then(res => {
        console.log("✅ [Service] My Profile:", res.data.data);
        return res.data.data;
      });
  },

  getTeachers: (page = 1, limit = 100) => {
    return axiosClient.get(`/users/teachers`, { params: { page, limit } })
      .then(res => {
        return res.data.data;
      });
  },


  getUserById: (id) => {
    return axiosClient.get(`/users/${id}/profile`)
      .then(res => res.data);
  },

  updateProfile: (id, updateData) => {
    return axiosClient.patch(`/users/${id}/profile`, updateData)
      .then(res => res.data);
  },

  softDeleteUser: (id) => {
    return axiosClient.patch(`/users/${id}/delete`)
      .then(res => res.data);
  },

  restoreUser: (id) => {
    return axiosClient.patch(`/users/${id}/restore`)
      .then(res => res.data);
  },

  resetPassword: (id) => {
    return axiosClient.post(`/users/${id}/reset-password`)
      .then(res => res.data);
  },

  sendEmail: (id, title, content) => {
    return axiosClient.post(`/users/${id}/send-email`, { title, content })
      .then(res => res.data);
  },

  searchUsers: (keyword) => {
    // Lưu ý: Nếu NestJS dùng @Body cho GET, ta phải dùng config 'data'
    return axiosClient.get("/users/search", { data: { keyword } })
      .then(res => res.data);
  },

  bulkCreateStudents: (users) => {
    return axiosClient.post("/users/bulk-create", { users })
      .then(res => res.data);
  }
};

export default userService;