import axios from "axios";
import { config } from "../config/config";

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true, // 🔥 REQUIRED FOR COOKIE AUTH
});

// Request interceptor — NO TOKEN HANDLING NEEDED (cookies handle auth)
api.interceptors.request.use((request) => {
  return request;
});

// Response interceptor — AUTO REFRESH TOKEN USING COOKIES
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest.url?.includes("/admin/signin") ||
      originalRequest.url?.includes("/admin/logout") ||
      originalRequest.url?.includes("/admin/refresh-token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint (cookie sent automatically)
        await api.post("/admin/refresh-token");
        // Retry original request after refreshing token
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
