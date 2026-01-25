// src/utils/axiosInstance.ts
import axios from 'axios';
import { config } from '../config/config';

const api = axios.create({
  baseURL: config.apiUrl,
});

// Request interceptor to attach access token
api.interceptors.request.use((req) => {
  const accessToken = localStorage.getItem('accesstoken');
  if (accessToken) req.headers.Authorization = `Bearer ${accessToken}`;
  return req;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors due to access token expired
    if (
      error.response?.status === 401 &&
      error.response?.data?.msg === 'Access token expired' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshtoken');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${config.apiUrl}/auth/refresh-token`, { refreshToken });
        const newAccessToken = res.data.accessToken;
        localStorage.setItem('accesstoken', newAccessToken);

        // Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh failed -> logout
        localStorage.removeItem('accesstoken');
        localStorage.removeItem('refreshtoken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
