import axios from "axios";


const axiosClient = axios.create({

  // baseURL: "https://677b-118-69-73-134.ngrok-free.app/api",
  baseURL: "http://localhost:3000/api",

  headers: {
    "Content-Type": "application/json",

    "ngrok-skip-browser-warning": "69420"
  },
  timeout: 100000,
});



axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Lỗi 401 nè! Đã chặn mọi logic tiếp theo.");


      return new Promise(() => { });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
