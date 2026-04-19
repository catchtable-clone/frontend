'use client';

import { useRouter } from 'next/navigation';

interface LoginRequiredProps {
  redirectTo: string;
}

export default function LoginRequired({ redirectTo }: LoginRequiredProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <p className="text-gray-500">로그인이 필요합니다</p>
      <button
        onClick={() => router.push(`/login?redirect=${redirectTo}`)}
        className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
      >
        로그인하기
      </button>
    </div>
  );
}
