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

export default axiosInstance;