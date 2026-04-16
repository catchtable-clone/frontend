'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import StoreCard from '@/components/store/StoreCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { mockStores } from '@/lib/mockData';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const results = mockStores.filter((store) => {
    const q = query.toLowerCase();
    return (
      store.name.toLowerCase().includes(q) ||
      store.category.toLowerCase().includes(q) ||
      store.address.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Header showSearch showBack defaultQuery={query} />
      <main className="flex-1 px-4 py-4">
        <p className="mb-3 text-sm text-gray-500">
          &apos;{query}&apos; 검색 결과 {results.length}건
        </p>
        {results.length > 0 ? (
          <div>
            {results.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">검색 결과가 없습니다.</p>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
