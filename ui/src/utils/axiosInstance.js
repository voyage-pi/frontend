import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/v1/trip-management/api", // sem barra no final
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance; 