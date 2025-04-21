// src/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5236/api", // Replace with your backend's URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
