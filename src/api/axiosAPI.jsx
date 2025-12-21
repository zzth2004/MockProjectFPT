import axios from "axios";


const axiosClient = axios.create({
  baseURL: "https://8d9253a64d0f.ngrok-free.app/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, 
});


axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized, logging out...");
      localStorage.removeItem("token");
      window.location.href = "/login"; 
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
