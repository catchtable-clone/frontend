import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  // CORS 우회를 위해 프록시(next.config.mjs)를 타도록 상대 경로로 변경합니다.
  baseURL: '/api/v1',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const { userId, accessToken } = useAuthStore.getState();

  // TODO: 백엔드 인증 구현 후 X-User-Id 제거. JWT 방식으로 전환
  if (userId !== null) {
    config.headers['X-User-Id'] = String(userId);
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
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
