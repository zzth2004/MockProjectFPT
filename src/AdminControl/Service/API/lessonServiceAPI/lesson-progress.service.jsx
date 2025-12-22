import axiosClient from "../../../../api/axiosAPI";

const lessonProgressService = {
    // ================= USER ACTIONS =================
    
    // Lấy tiến độ của chính mình cho 1 bài học
    getMyProgress: async (lessonId) => {
        return axiosClient.get(`/lesson-progress/my/${lessonId}`).then(res => res.data.data);
    },

    // Cập nhật tiến độ (Vị trí xem video, trạng thái hoàn thành)
    updateMyProgress: async (lessonId, progressData) => {
        // progressData: { lastWatchedPosition: number, isCompleted: boolean }
        return axiosClient.patch(`/lesson-progress/update/${lessonId}`, progressData).then(res => res.data.data);
    },

    // ================= ADMIN ACTIONS =================

    // Admin lấy danh sách tiến độ của tất cả học viên trong 1 bài học
    getAdminLessonProgress: async (lessonId, params = { page: 1, limit: 20 }) => {
        return axiosClient.get(`/lesson-progress/admin/${lessonId}`, { params }).then(res => {
            // Backend trả về cấu trúc { items: [], meta: {} }
            return res.data.data;
        });
    }
};

export default lessonProgressService;