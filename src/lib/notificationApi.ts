import { Notification } from '@/types/store'; // Assuming these types exist

// 이 부분은 실제 백엔드 API 엔드포인트에 맞춰 조정해야 합니다.
// Next.js API Routes를 사용하거나, 프록시 설정을 통해 백엔드와 통신할 수 있습니다.
const API_BASE_URL = '/api/v1';

interface PaginatedNotifications {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  // ... 기타 페이지네이션 정보 (필요시 추가)
}

/**
 * 알림 목록을 페이지네이션하여 가져옵니다.
 * @param page 가져올 페이지 번호 (0부터 시작)
 * @param size 페이지당 항목 수
 * @returns PaginatedNotifications 객체
 */
export const fetchNotifications = async (
  page: number = 0,
  size: number = 10,
): Promise<PaginatedNotifications> => {
  console.log(`[notificationApi] Fetching notifications for userId=1, page=${page}, size=${size}`);
  const response = await fetch(`${API_BASE_URL}/notifications?userId=1&page=${page}&size=${size}`);
  console.log(`[notificationApi] Fetch notifications response status: ${response.status}`);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[notificationApi] Failed to fetch notifications. Response body: ${errorBody}`);
    throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
  }
  const apiResponse = await response.json();
  console.log('[notificationApi] Full API Response for notifications:', apiResponse);
  // 백엔드는 ApiResponse로 감싸서 반환하므로 실제 Page 객체는 result 필드에 있습니다.
  // data가 null 또는 undefined일 경우를 대비하여 기본값 제공
  return apiResponse.data || { content: [], totalElements: 0, totalPages: 0 };
};

/**
 * 특정 알림을 읽음 상태로 변경합니다.
 * @param id 읽음 처리할 알림의 ID
 */
export const markNotificationAsRead = async (id: number): Promise<void> => {
  console.log(`[notificationApi] Marking notification ${id} as read for userId=1`);
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read?userId=1`, {
    method: 'PATCH', // 또는 'PUT'
  });
  console.log(`[notificationApi] Mark as read response status: ${response.status}`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to mark notification ${id} as read`);
  }
};

/**
 * 모든 알림을 읽음 상태로 변경합니다.
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  // 참고: 백엔드 NotificationController.java에 /read-all 엔드포인트가 없습니다. 추가가 필요합니다.
  console.log('[notificationApi] Marking all notifications as read for userId=1');
  const response = await fetch(`${API_BASE_URL}/notifications/read-all?userId=1`, {
    method: 'PATCH', // 또는 'PUT'
  });
  console.log(`[notificationApi] Mark all as read response status: ${response.status}`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error('Failed to mark all notifications as read');
  }
};

/**
 * 읽지 않은 알림의 개수를 가져옵니다.
 * @returns 읽지 않은 알림의 개수
 */
export const fetchUnreadNotificationsCount = async (): Promise<number> => {
  console.log('[notificationApi] Fetching unread notifications count for userId=1');
  const response = await fetch(`${API_BASE_URL}/notifications/unread-count?userId=1`);
  console.log(`[notificationApi] Unread count response status: ${response.status}`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error('Failed to fetch unread notifications count');
  }
  // 백엔드는 ApiResponse<Long> 형태로 반환하므로, 실제 카운트 값은 result 필드에 있습니다.
  const apiResponse = await response.json();
  console.log('[notificationApi] Unread count API Response:', apiResponse);
  return apiResponse.data ?? 0; // data가 null 또는 undefined일 경우 0을 반환
};