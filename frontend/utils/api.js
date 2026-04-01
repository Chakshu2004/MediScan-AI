/**
 * utils/api.js
 * Axios instance pre-configured with base URL, JWT injection, and token refresh.
 */
import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) {
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });
        Cookies.set("access_token", data.access_token, { expires: 1 });
        Cookies.set("refresh_token", data.refresh_token, { expires: 30 });
        api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        processQueue(null, data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const setTokens = (accessToken, refreshToken) => {
  Cookies.set("access_token", accessToken, { expires: 1, secure: true, sameSite: "Lax" });
  Cookies.set("refresh_token", refreshToken, { expires: 30, secure: true, sameSite: "Lax" });
};

export const clearTokens = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
};

export const isAuthenticated = () => !!Cookies.get("access_token");

// ── API calls ─────────────────────────────────────────────────────────────────

/** Auth */
export const getGoogleAuthUrl  = ()       => api.get("/auth/google/url");
export const googleCallback    = (code)   => api.post("/auth/google/callback", { code });
export const refreshTokens     = (token)  => api.post("/auth/refresh", { refresh_token: token });

/** User */
export const getMe = () => api.get("/users/me");

/** Reports */
export const uploadReport = (formData) =>
  api.post("/reports/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const listReports  = (limit = 20, offset = 0) =>
  api.get("/reports/", { params: { limit, offset } });
export const getReport    = (id)  => api.get(`/reports/${id}`);
export const deleteReport = (id)  => api.delete(`/reports/${id}`);

/** Analysis */
export const triggerAnalysis = (reportId) =>
  api.post("/analysis/", { report_id: reportId });
export const getAnalysis     = (reportId) =>
  api.get(`/analysis/${reportId}`);

export default api;
