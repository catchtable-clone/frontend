'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import StoreCard from '@/components/store/StoreCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FilterDropdown from '@/components/common/FilterDropdown';
import { useStoresInfiniteQuery } from '@/lib/storeQuery';
import { STORE_CATEGORIES, STORE_DISTRICTS } from '@/lib/storeEnum';

const CATEGORY_OPTIONS = STORE_CATEGORIES.map((c) => ({
  key: c.enumValue,
  label: `${c.icon} ${c.label}`,
}));

const DISTRICT_OPTIONS = STORE_DISTRICTS.map((d) => ({
  key: d.enumValue,
  label: d.label,
}));

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStoresInfiniteQuery(
    {
      name: query,
      category: selectedCategory ?? undefined,
      district: selectedDistrict ?? undefined,
    },
    10,
  );

  const results = data?.pages.flat() ?? [];

  // 무한 스크롤 트리거
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <Header showSearch showBack defaultQuery={query} />
      <main className="flex-1">
        {/* 필터 바 */}
        <div className="relative flex gap-2 border-b border-gray-100 px-4 py-2.5">
          <FilterDropdown
            label="카테고리"
            options={CATEGORY_OPTIONS}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <FilterDropdown
            label="지역"
            options={DISTRICT_OPTIONS}
            selected={selectedDistrict}
            onSelect={setSelectedDistrict}
          />
        </div>

        {/* 검색 결과 */}
        <div className="px-4 py-3">
          <p className="mb-3 text-sm text-gray-500">
            &apos;{query}&apos; 검색 결과 {results.length}건{hasNextPage ? '+' : ''}
          </p>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <LoadingSpinner />
            </div>
          ) : results.length > 0 ? (
            <>
              <div>
                {results.map((store) => (
                  <StoreCard key={store.storeId} store={store} />
                ))}
              </div>
              <div ref={sentinelRef} className="h-4" />
              {isFetchingNextPage && (
                <p className="py-4 text-center text-sm text-gray-400">불러오는 중...</p>
              )}
              {!hasNextPage && results.length > 0 && (
                <p className="py-4 text-center text-xs text-gray-400">마지막 매장입니다.</p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-sm">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
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
