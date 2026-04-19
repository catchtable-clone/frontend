'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CalendarCheck,
  Clock,
  MapPin,
  CheckCheck,
} from 'lucide-react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import FilterChip from '@/components/common/FilterChip';
import { mockNotifications } from '@/lib/mockData';
import { timeAgo } from '@/lib/utils';
import type { Notification, NotificationType } from '@/types/store';

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof CalendarCheck; color: string; bg: string }
> = {
  RESERVATION_CONFIRMED: {
    icon: CalendarCheck,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  RESERVATION_REMIND: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  VACANCY: {
    icon: MapPin,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<NotificationType | 'ALL'>('ALL');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered =
    filter === 'ALL'
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.type === 'VACANCY') {
      router.push(`/stores/${notification.storeId}`);
    } else {
      router.push('/reservations');
    }
  };

  const filters: { key: NotificationType | 'ALL'; label: string }[] = [
    { key: 'ALL', label: '전체' },
    { key: 'RESERVATION_CONFIRMED', label: '예약 확정' },
    { key: 'RESERVATION_REMIND', label: '리마인드' },
    { key: 'VACANCY', label: '빈자리' },
  ];

  return (
    <>
      <Header title="알림" />

      <main className="flex-1">
        {/* 필터 + 모두 읽음 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex gap-2">
            {filters.map(({ key, label }) => (
              <FilterChip
                key={key}
                label={label}
                active={filter === key}
                onClick={() => setFilter(key)}
              />
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-500"
            >
              <CheckCheck size={14} />
              모두 읽음
            </button>
          )}
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
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={`flex gap-3 border-b border-gray-50 px-4 py-4 text-left transition-colors hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-orange-50/30' : ''
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
                      {!notification.isRead && (
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-gray-600">
                      {notification.storeName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {notification.message}
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
