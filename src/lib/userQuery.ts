import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getMe } from './userApi';
import { useAuthStore } from '@/stores/authStore';

/**
 * 로그인된 사용자 정보를 백엔드에서 가져오고 authStore에 자동 동기화
 */
export const useMeQuery = () => {
  const userId = useAuthStore((s) => s.userId);
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery({
    queryKey: ['me', userId],
    queryFn: getMe,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // 응답 변경 시 store 동기화
  useEffect(() => {
    if (query.data && query.data.userId) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
};
