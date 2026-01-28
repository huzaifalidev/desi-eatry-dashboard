import axios from "axios";
import { config } from "../config/config";

const api = axios.create({
  baseURL: config.apiUrl,
});

/* ================= REQUEST ================= */
api.interceptors.request.use((request) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

/* ================= RESPONSE ================= */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post(
          `${config.apiUrl}/admin/refresh-token`,
          { refreshToken }
        );

        localStorage.setItem("accessToken", res.data.accessToken);

        originalRequest.headers.Authorization =
          `Bearer ${res.data.accessToken}`;

        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
