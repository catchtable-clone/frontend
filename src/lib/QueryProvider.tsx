'use client';

import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // mutation 에러는 axios 인터셉터가 토스트로 처리함.
        // 여기서는 mutation 단위 onError를 호출자가 정의하지 않은 경우의 fallback만 담당.
        // (인터셉터에서 이미 토스트가 나가므로 별도 처리 불필요 — MutationCache는 자리만 잡아둔다)
        mutationCache: new MutationCache({
          onError: () => {
            // 인터셉터에서 처리됨 — 추가 동작이 필요할 때 여기에 작성
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
