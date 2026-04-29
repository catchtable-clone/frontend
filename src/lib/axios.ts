import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  // CORS 우회를 위해 프록시(next.config.ts)를 타도록 상대 경로로 변경합니다.
  baseURL: '/api/v1',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
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
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
