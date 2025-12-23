import axios from "axios";


const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    // "ngrok-skip-browser-warning": "69420",
  },
  timeout: 10000, 
});


axiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("jwt"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// axiosClient.interceptors.response.use(
//   (response) => {
//     return response.data;
//   },
//   (error) => {
    
//     if (error.response && error.response.status === 401) {
//       console.error("Unauthorized, logging out...");
//       localStorage.removeItem("token");
//       window.location.href = "/login"; 
//     }

//     return Promise.reject(error);
//   }
// );
// axiosClient.js
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Lỗi 401 nè! Đã chặn mọi logic tiếp theo.");
      
      // MẸO: Trả về một promise trắng để "đóng băng" chain phía sau
      return new Promise(() => {}); 
    }
    
    // Đối với các lỗi khác, vẫn reject để component xử lý
    return Promise.reject(error);
  }
);

export default axiosClient;
