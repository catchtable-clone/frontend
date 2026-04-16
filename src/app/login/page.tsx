'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuthStore } from '@/stores/authStore';

const GOOGLE_AUTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const redirectTo = searchParams.get('redirect') || '/';

  const handleGoogleLogin = () => {
    if (IS_MOCK) {
      setAccessToken('mock-access-token');
      router.push(redirectTo);
    } else {
      window.location.href = `${GOOGLE_AUTH_URL}?redirect=${encodeURIComponent(redirectTo)}`;
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {/* 서비스 소개 */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">캐치테이블 클론</h1>
          <p className="text-center text-sm leading-relaxed text-gray-500">
            레스토랑 예약부터 빈자리 알림까지
            <br />
            간편하게 맛집을 예약하세요
          </p>
        </div>

        {/* Google 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google로 시작하기
        </button>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
