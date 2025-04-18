import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "api/v1/trip-management/api", // Updated to include /api prefix
  timeout: 40000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosPlace = axios.create({
  baseURL: "/api/v1/place-wrapper", // Updated to use the nginx proxy path
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosUser = axios.create({
  baseURL: "/api/v1/user-management",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosRecommendation = axios.create({
  baseURL: "/api/v1/recommendations",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
