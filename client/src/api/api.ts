import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7173/api", // Update if different
});

// Automatically include JWT token if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
