'use client';

import { useRouter } from 'next/navigation';
import {
  LogOut, Settings, Bell, Shield, HelpCircle, MessageSquare, Ticket,
  Store, UtensilsCrossed,
} from 'lucide-react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import LoginRequired from '@/components/common/LoginRequired';
import { useAuthStore } from '@/stores/authStore';
import { useMeQuery } from '@/lib/userQuery';

export default function MyPage() {
  const router = useRouter();
  const { accessToken, user, logout } = useAuthStore();
  const isLoggedIn = !!accessToken;
  // 로그인 후 백엔드에서 user 정보 자동 동기화 (role 등)
  useMeQuery();

  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <Header title="마이페이지" />
      <main className="flex-1 px-4 py-4">
        {isLoggedIn ? (
          <div className="flex flex-col gap-4">
            {/* 프로필 */}
            <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-500">
                {user?.nickname?.[0] ?? 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.nickname ?? '사용자'}
                  {isAdmin && (
                    <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-600">
                      ADMIN
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">{user?.email ?? ''}</p>
              </div>
            </div>

            {/* 일반 메뉴 */}
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
            </div>

            {/* 관리자 메뉴 */}
            {isAdmin && (
              <div className="flex flex-col">
                <p className="px-2 pt-2 text-xs font-semibold text-orange-500">관리자</p>
                <button
                  onClick={() => router.push('/mypage/admin/store')}
                  className="flex items-center gap-3 border-b border-gray-100 px-2 py-4 text-sm text-gray-700"
                >
                  <Store size={20} className="text-orange-400" />
                  매장 등록
                </button>
                <button
                  onClick={() => router.push('/mypage/admin/menu')}
                  className="flex items-center gap-3 border-b border-gray-100 px-2 py-4 text-sm text-gray-700"
                >
                  <UtensilsCrossed size={20} className="text-orange-400" />
                  메뉴 등록
                </button>
                <button
                  onClick={() => router.push('/mypage/admin/coupon')}
                  className="flex items-center gap-3 border-b border-gray-100 px-2 py-4 text-sm text-gray-700"
                >
                  <Ticket size={20} className="text-orange-400" />
                  쿠폰 템플릿 생성
                </button>
              </div>
            )}

            {/* 로그아웃 */}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-2 py-4 text-sm text-red-500"
            >
              <LogOut size={20} />
              로그아웃
            </button>
          </div>
        ) : (
          <LoginRequired redirectTo="/mypage" />
        )}
      </main>
      <BottomNav />
    </>
  );
}
