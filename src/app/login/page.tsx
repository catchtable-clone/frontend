'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@/stores/authStore';
import { googleLogin } from '@/lib/api/authApi';
import toast from 'react-hot-toast';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const redirectTo = searchParams.get('redirect') || '/';
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error('Google 로그인에 실패했습니다.');
      return;
    }

    setLoading(true);
    try {
      const data = await googleLogin(idToken);
      setAuth(data.accessToken, data.refreshToken, data.userId, data.nickname, data.profileImage);
      router.push(redirectTo);
    } catch {
      toast.error('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">캐치테이블 클론</h1>
          <p className="text-center text-sm leading-relaxed text-gray-500">
            레스토랑 예약부터 빈자리 알림까지
            <br />
            간편하게 맛집을 예약하세요
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              로그인 중...
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google 로그인에 실패했습니다.')}
                width={380}
                text="signin_with"
                shape="rectangular"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
