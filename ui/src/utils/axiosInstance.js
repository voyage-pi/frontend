import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://trip-management:8080", // sem barra no final
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance; 