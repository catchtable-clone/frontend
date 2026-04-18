'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, CalendarCheck, Bell, User } from 'lucide-react';

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/category', label: '카테고리', icon: LayoutGrid },
  { href: '/reservations', label: '예약', icon: CalendarCheck },
  { href: '/notifications', label: '알림', icon: Bell },
  { href: '/mypage', label: '마이', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-50 border-t border-gray-200 bg-white">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <Icon size={24} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
