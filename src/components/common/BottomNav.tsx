'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, CalendarCheck, Bell, User } from 'lucide-react';
import { useUnreadNotificationsCountQuery } from '@/lib/notificationQuery';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/category', label: '카테고리', icon: LayoutGrid },
  { href: '/reservations', label: '예약', icon: CalendarCheck },
  { href: '/notifications', label: '알림', icon: Bell },
  { href: '/mypage', label: '마이', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { accessToken } = useAuthStore();
  const isLoggedIn = !!accessToken;

  // 로그인 상태일 때만 안 읽은 알림 개수를 가져옵니다.
  const { data: unreadCount } = useUnreadNotificationsCountQuery(isLoggedIn);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-md justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'
              }`}
            >
<div className="relative">
  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
  {label === '알림' && isLoggedIn && unreadCount !== undefined && unreadCount > 0 && (
    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )}
</div>
<span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}