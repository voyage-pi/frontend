import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8081/api", 
  timeout: 10000, 
});

export default axiosInstance;
