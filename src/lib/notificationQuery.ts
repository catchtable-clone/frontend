import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fetchUnreadNotificationsCount,
} from './notificationApi'; // 상대 경로 임포트: tsconfig.json alias 문제 우회
import type { Notification } from '@/types/store';

// React Query 캐시 키 상수
const NOTIFICATIONS_QUERY_KEY = ['notifications'];
const UNREAD_COUNT_QUERY_KEY = ['unreadNotificationsCount'];

/**
 * 알림 목록을 가져오는 React Query 훅
 */
export const useNotificationsQuery = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, page, size],
    queryFn: () => fetchNotifications(page, size),
    // 필요에 따라 staleTime, cacheTime 등 옵션 추가
  });
};

/**
 * 특정 알림을 읽음 상태로 변경하는 React Query 뮤테이션 훅
 */
export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: () => {
      // 알림 목록과 읽지 않은 알림 개수 쿼리를 무효화하여 최신 상태를 다시 가져오도록 합니다.
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
    // onError, onMutate 등을 추가하여 낙관적 업데이트(Optimistic Update) 구현 가능
  });
};

/**
 * 모든 알림을 읽음 상태로 변경하는 React Query 뮤테이션 훅
 */
export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
};

/**
 * 읽지 않은 알림 개수를 가져오는 React Query 훅
 */
export const useUnreadNotificationsCountQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: fetchUnreadNotificationsCount,
    enabled,
    refetchInterval: 60 * 1000, // 1분마다 자동으로 읽지 않은 알림 개수를 업데이트
  });
};