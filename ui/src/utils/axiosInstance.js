import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/api/v1/trip-management/api", // sem barra no final
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const axiosPlace = axios.create({
  baseURL: "/api/v1/place-wrapper", // Updated to use the nginx proxy path
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});