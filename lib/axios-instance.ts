// src/api/axiosInstance.ts
import axios from "axios";
import { config } from "../config/config";

const isClient = () => typeof window !== "undefined";

const api = axios.create({
  baseURL: config.apiUrl,
});

// Request interceptor: attach access token
api.interceptors.request.use((request) => {
  if (isClient()) {
    const token = localStorage.getItem("accesstoken");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
  }
  return request;
});

// Response interceptor: handle 401/403
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (isClient() && error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshtoken");

      if (!refreshToken) {
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshtoken");
        window.location.href = "/login"; // redirect or handle logout
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${config.apiUrl}/admin/refresh-token`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const newToken = res.data.accessToken;
        localStorage.setItem("accesstoken", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest); // retry the original request
      } catch (err) {
        localStorage.removeItem("accesstoken");
        localStorage.removeItem("refreshtoken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
