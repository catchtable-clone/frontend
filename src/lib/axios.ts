import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorToast?: boolean;
    _retry?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    skipErrorToast?: boolean;
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (status === 401 && !originalRequest._retry) {
      const { refreshToken, setAccessToken, logout } = useAuthStore.getState();

      if (refreshToken) {
        originalRequest._retry = true;
        try {
          const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
          const newAccessToken: string = res.data.data.accessToken;
          setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch {
          logout();
          if (typeof window !== 'undefined') {
            toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      }

      // 비로그인 상태에서 401 — 리다이렉트 없이 에러만 반환
      // 로그인이 필요한 페이지는 LoginRequired 컴포넌트가 처리
      return Promise.reject(error);
    }

    if (error.config?.skipErrorToast) {
      return Promise.reject(error);
    }

    if (typeof window !== 'undefined') {
      const message =
        error.response?.data?.message ??
        (status ? `요청에 실패했습니다. (${status})` : '네트워크 오류가 발생했습니다.');
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
