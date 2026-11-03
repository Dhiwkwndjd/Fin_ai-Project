import axios from "axios";
import { useAuthStore } from "../store/authStore";

const baseURL = import.meta.env.VITE_API_URL;
const axiosInstance = axios.create({ baseURL });
const authUrls = ["/auth/login", "/auth/register", "/auth/refresh"];

axiosInstance.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response && error.response.status === 401;
    const isAuthRequest = authUrls.includes(originalRequest.url);

    if (!isUnauthorized || originalRequest._alreadyRetried || isAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._alreadyRetried = true;
    const refreshToken = useAuthStore.getState().refreshToken;

    try {
      const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const newAccessToken = refreshResponse.data.access_token;
      const newRefreshToken = refreshResponse.data.refresh_token;
      useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
