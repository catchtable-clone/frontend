'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      setAccessToken(token);
      router.replace('/');
    } else {
      router.replace('/login');
    }
  }, [searchParams, setAccessToken, router]);

  return <LoadingSpinner message="로그인 중..." />;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<LoadingSpinner message="로그인 중..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
