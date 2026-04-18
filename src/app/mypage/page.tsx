'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Settings, Bell, Shield, HelpCircle, MessageSquare, Ticket } from 'lucide-react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import { useAuthStore } from '@/stores/authStore';

export default function MyPage() {
  const router = useRouter();
  const { accessToken, logout } = useAuthStore();
  const isLoggedIn = !!accessToken;

  return (
    <>
      <Header title="마이페이지" />
      <main className="flex-1 px-4 py-4">
        {isLoggedIn ? (
          <div className="flex flex-col gap-4">
            {/* 프로필 */}
            <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-500">
                U
              </div>
              <div>
                <p className="font-semibold text-gray-900">사용자</p>
                <p className="text-sm text-gray-500">user@example.com</p>
              </div>
            </div>

            {/* 메뉴 */}
            <div className="flex flex-col">
              <button className="flex items-center gap-3 border-b border-gray-100 px-2 py-4 text-sm text-gray-700">
                <Settings size={20} className="text-gray-400" />
                프로필 수정
              </button>
              <button
                onClick={() => router.push('/mypage/reviews')}
                className="flex items-center gap-3 border-b border-gray-100 px-2 py-4 text-sm text-gray-700"
              >
                <MessageSquare size={20} className="text-gray-400" />
                리뷰 관리
              </button>
              <button
                onClick={() => router.push('/mypage/coupons')}
                className="flex items-center gap-3 border-b border-gray-100 px-2 py-4 text-sm text-gray-700"
              >
                <Ticket size={20} className="text-gray-400" />
                쿠폰 관리
              </button>
              <button className="flex items-center gap-3 border-b border-gray-100 px-2 py-4 text-sm text-gray-700">
                <Bell size={20} className="text-gray-400" />
                알림 설정
              </button>
              <button className="flex items-center gap-3 border-b border-gray-100 px-2 py-4 text-sm text-gray-700">
                <Shield size={20} className="text-gray-400" />
                비밀번호 변경
              </button>
              <button className="flex items-center gap-3 border-b border-gray-100 px-2 py-4 text-sm text-gray-700">
                <HelpCircle size={20} className="text-gray-400" />
                고객센터
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-2 py-4 text-sm text-red-500"
              >
                <LogOut size={20} />
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-16">
            <p className="text-gray-500">로그인이 필요합니다</p>
            <button
              onClick={() => router.push('/login?redirect=/mypage')}
              className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              로그인하기
            </button>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
