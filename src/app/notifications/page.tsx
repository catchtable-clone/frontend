'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  CheckCheck,
  Loader2, // 로딩 스피너를 위해 추가
} from 'lucide-react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import FilterChip from '@/components/common/FilterChip';
import { timeAgo } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types/store';
import {
  useNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '../../lib/notificationQuery'; // 상대 경로 임포트: tsconfig.json alias 문제 우회
import LoginRequired from '@/components/common/LoginRequired';
import { useAuthStore } from '@/stores/authStore';

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof CalendarCheck; color: string; bg: string }
> = {
  VACANCY: {
    icon: MapPin,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  RESERVATION_CONFIRMED: {
    icon: CalendarCheck,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  RESERVATION_CANCELED: {
    icon: CalendarX,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  RESERVATION_CHANGED: {
    icon: RefreshCw,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  RESERVATION_VISITED: {
    icon: CheckCircle2,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  RESERVATION_REMINDER: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const isLoggedIn = !!accessToken;

  // React Query 훅을 사용하여 알림 목록을 가져옵니다.
  const {
    data: notificationsData,
    isLoading,
    isError,
    error,
  } = useNotificationsQuery();
  const notifications = notificationsData?.content || []; // 데이터가 없으면 빈 배열

  // 알림 읽음 처리 뮤테이션 훅
  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();

  const [filter, setFilter] = useState<NotificationType | 'ALL'>('ALL');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered =
    filter === 'ALL'
      ? notifications // API에서 가져온 데이터 사용
      : notifications.filter((n) => n.type === filter); // API 데이터 필터링

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id); // 뮤테이션 실행
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(); // 뮤테이션 실행
  };

  const handleClick = (notification: Notification) => {
    handleMarkAsRead(notification.notificationId); // 뮤테이션 사용
    if (notification.type === 'VACANCY') {
      router.push(`/stores/${notification.relatedItemId}`);
    } else {
      router.push('/reservations');
    }
  };

  const filters: { key: NotificationType | 'ALL'; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'VACANCY', label: '빈자리' },
    { key: 'RESERVATION_CONFIRMED', label: '예약 확정' },
    { key: 'RESERVATION_CANCELED', label: '예약 취소' },
    { key: 'RESERVATION_CHANGED', label: '예약 변경' },
    { key: 'RESERVATION_VISITED', label: '방문 완료' },
    { key: 'RESERVATION_REMINDER', label: '리마인드' },
  ];

  if (!isLoggedIn) {
    return (
      <>
        <Header title="알림" />
        <main className="flex-1">
          <LoginRequired redirectTo="/notifications" />
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header title="알림" />

      <main className="flex-1">
        {/* 필터 + 모두 읽음 */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="scrollbar-hide flex flex-1 gap-2 overflow-x-auto whitespace-nowrap">
            {filters.map(({ key, label }) => (
              <FilterChip
                key={key}
                label={label}
                active={filter === key}
                onClick={() => setFilter(key)}
              />
            ))}
          </div>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex flex-shrink-0 items-center gap-1 whitespace-nowrap text-xs text-gray-500 hover:text-orange-500 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:text-gray-300"
          >
            <CheckCheck size={14} />
            모두 읽음
          </button>
        </div>

        {/* 알림 목록 */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Bell size={40} className="text-gray-300" />
            <p className="text-sm text-gray-400">알림이 없습니다</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((notification) => {
              const config = TYPE_CONFIG[notification.type];
              const Icon = config.icon;

              return (
                <button
                  key={notification.notificationId}
                  onClick={() => handleClick(notification)}
                  className={`flex gap-3 border-b border-gray-50 px-4 py-4 text-left transition-colors hover:bg-gray-50 ${
                    !notification.read ? 'bg-orange-50/30' : ''
                  }`}
                >
                  {/* 아이콘 */}
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}
                  >
                    <Icon size={18} className={config.color} />
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-gray-600">
                      {notification.storeName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {notification.content}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}
