import api from '@/lib/axios';
import { unwrap } from '@/lib/apiUtils';
import type { AuthUser } from '@/stores/authStore';

/**
 * 현재 로그인한 사용자의 정보 조회 (백엔드 GET /users/me)
 * X-User-Id 헤더는 axios 인터셉터가 자동 첨부
 */
export const getMe = async (): Promise<AuthUser> => {
  const response = await api.get('/users/me');
  return unwrap<AuthUser>(response, {} as AuthUser);
};
