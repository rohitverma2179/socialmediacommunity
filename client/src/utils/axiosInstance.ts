import axios from "axios";

const BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:3000/api" 
  // : "https://community-final-vf8t.vercel.app/api";
  : "https://socialmediacommunitybackend.vercel.app/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;