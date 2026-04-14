import axios from "axios";
 const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000, // 👈 move timeout here
  headers: {
    'Content-Type': 'application/json',
    // Replace below with actual token dynamically if needed
    // 'Authorization': `Bearer ${yourToken}`
  },
});

export default instance