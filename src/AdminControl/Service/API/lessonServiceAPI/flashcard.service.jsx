import axiosClient from "../../../../api/axiosAPI";

/**
 * Flashcard Service - Hệ thống ghi nhớ thông minh
 */
const flashcardService = {
    // --- QUẢN LÝ BỘ THẺ (DECK) ---
    getAllDecks: async (page = 1, limit = 10, search = "") => {
        return axiosClient.get("/flashcards/all", {
            params: { page, limit, search }
        }).then(res => {
            // Trả về { data: items[], meta: { total, page, totalPages } }
            return res.data.data;
        });
    },

    // Lấy tất cả bộ thẻ có quyền truy cập (Công khai hoặc của chính mình)
    getAllAccessibleDecks: async (page = 1, limit = 10, search = "") => {
        return axiosClient.get("/flashcards/deck/search", {
            params: { page, limit, search }
        }).then(res => res.data.data);
    },

    // Lấy bộ thẻ của tôi
    getMyDecks: async () => {
        return axiosClient.get("/flashcards/deck/list/my").then(res => res.data.data);
    },

    getDeckDetail: async (id) => {
        return axiosClient.get(`/flashcards/deck/${id}/detail`).then(res => res.data.data);
    },

    createDeck: async (data) => {
        return axiosClient.post("/flashcards/deck/new", data).then(res => res.data.data);
    },

    updateDeck: async (id, data) => {
        return axiosClient.patch(`/flashcards/deck/${id}/update`, data).then(res => res.data.data);
    },

    deleteDeck: async (id) => {
        return axiosClient.delete(`/flashcards/deck/${id}/delete`).then(res => res.data.data);
    },

    // --- QUẢN LÝ THẺ (CARD) ---

    addCard: async (data) => {
        return axiosClient.post("/flashcards/card/new", data).then(res => res.data.data);
    },

    updateCard: async (id, data) => {
        return axiosClient.patch(`/flashcards/card/${id}/update`, data).then(res => res.data.data);
    },

    deleteCard: async (id) => {
        return axiosClient.delete(`/flashcards/card/${id}/delete`).then(res => res.data.data);
    },

    // Lấy danh sách thẻ đến hạn cần học hôm nay
    getDueCards: async (deckId) => {
        return axiosClient.get(`/flashcards/learning/deck/${deckId}/due`).then(res => res.data.data);
    },

    // Gửi kết quả đánh giá (Thuật toán Spaced Repetition)
    submitReview: async (cardId, qualityRating) => {
        return axiosClient.post("/flashcards/learning/review/submit", {
            cardId,
            qualityRating
        }).then(res => res.data.data);
    },

    // --- FAVORITE (STAR) MANAGEMENT ---
    
    toggleStar: async (cardId) => {
        return axiosClient.post(`/flashcards/learning/card/${cardId}/star`).then(res => res.data.data);
    },

    getStarredFlashcards: async (deckId) => {
        return axiosClient.get(`/flashcards/learning/deck/${deckId}/stars`).then(res => res.data.data);
    }
};

export default flashcardService;