import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { config } from '../config/config';

interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: config.apiUrl,
});

const isClient = () => typeof window !== 'undefined';

/* =======================
   Token helpers
======================= */
const getAccessToken = () => {
  if (!isClient()) return null;
  return localStorage.getItem('accesstoken');
};

const getRefreshToken = () => {
  if (!isClient()) return null;
  return localStorage.getItem('refreshtoken');
};

const setAccessToken = (token: string) => {
  if (isClient()) localStorage.setItem('accesstoken', token);
};

const logout = () => {
  if (!isClient()) return;
  localStorage.removeItem('accesstoken');
  localStorage.removeItem('refreshtoken');
  window.location.href = '/login';
};

/* =======================
   Refresh queue logic
======================= */
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}[] = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

/* =======================
   Request interceptor
======================= */
api.interceptors.request.use((req) => {
  if (isClient()) {
    const accessToken = getAccessToken();
    if (accessToken) {
      req.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return req;
});

/* =======================
   Response interceptor
======================= */
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    if (
      isClient() &&
      error.response?.status === 401 &&
      error.response?.data?.msg === 'Access token expired' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers!.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw error;

        const response = await axios.post(
          `${config.apiUrl}/auth/refresh-token`,
          { refreshToken }
        );

        const newAccessToken = response.data.accessToken;
        setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers!.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err as AxiosError, null);
        logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
