import axiosClient from "../../../../api/axiosAPI";

const enrollmentService = {
  // 1. Đăng ký ghi danh (Học viên hoặc Admin thực hiện)
  enroll: ({ userId, courseId, classId = null, orderId = null }) => {
    return axiosClient.post("/user-enrollments/enroll", { 
      userId, 
      courseId, 
      classId, 
      orderId // Gửi thêm orderId lên
    }).then(res => {
      console.log("Enrollment response:", res.data);
      return res.data
    });
  },

  // 2. Lấy danh sách khóa học đã tham gia của một học viên
  getByUser: (userId) => {
    return axiosClient.get(`/user-enrollments/user/${userId}`);
  },

  // 3. Xem chi tiết ghi danh
  getDetail: (id) => {
    return axiosClient.get(`/user-enrollments/${id}/detail`);
  },

  // 4. Học viên tự cập nhật tiến độ (%)
  updateProgress: (id, progressPercent) => {
    return axiosClient.patch(`/user-enrollments/${id}/progress`, { progressPercent });
  },

  // 5. Giáo viên/Admin duyệt trạng thái (ACTIVE, COMPLETED...)
  updateStatus: (id, status) => {
    return axiosClient.patch(`/user-enrollments/${id}/status`, { status });
  },

  // 6. Admin sửa tổng quát (Chuyển lớp)
  adminUpdate: (id, data) => {
    return axiosClient.patch(`/user-enrollments/${id}/admin-update`, data);
  },

  // 7. Hủy ghi danh
  cancel: (id) => {
    return axiosClient.delete(`/user-enrollments/${id}/cancel`);
  }
};

export default enrollmentService;