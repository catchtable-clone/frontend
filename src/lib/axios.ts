import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';

// 특정 호출에서 전역 토스트를 끄고 싶을 때 사용 — config에 skipErrorToast: true 전달
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

const api = axios.create({
  // CORS 우회를 위해 프록시(next.config.ts)를 타도록 상대 경로로 변경합니다.
  baseURL: '/api/v1',
  timeout: 10000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken, userId } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  // 백엔드가 X-User-Id 헤더로 사용자 식별 → userId 자동 첨부
  if (userId) {
    config.headers['X-User-Id'] = String(userId);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;

    // 401: 인증 만료 → 로그아웃 후 로그인으로
    if (status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        toast.error('로그인이 필요합니다.');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // 호출자가 명시적으로 토스트를 끈 경우 (mutation onError에서 직접 처리)
    if (error.config?.skipErrorToast) {
      return Promise.reject(error);
    }

    // 그 외 모든 HTTP 에러 — 백엔드 message 우선, 없으면 기본 메시지
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
