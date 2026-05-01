import api from '@/lib/axios';
import { Notification } from '@/types/store';

interface PaginatedNotifications {
  content: Notification[];
  totalElements: number;
  totalPages: number;
}

interface ApiEnvelope<T> {
  status: number;
  message: string;
  data: T;
}

const EMPTY_PAGE: PaginatedNotifications = {
  content: [],
  totalElements: 0,
  totalPages: 0,
};

export const fetchNotifications = async (
  page: number = 0,
  size: number = 10,
): Promise<PaginatedNotifications> => {
  const { data } = await api.get<ApiEnvelope<PaginatedNotifications>>('/notifications', {
    params: { page, size },
  });
  return data.data ?? EMPTY_PAGE;
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};

export const fetchUnreadNotificationsCount = async (): Promise<number> => {
  const { data } = await api.get<ApiEnvelope<number>>('/notifications/unread-count');
  return data.data ?? 0;
};
