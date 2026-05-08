'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import StoreCard from '@/components/store/StoreCard';
import { useStoresInfiniteQuery } from '@/lib/storeQuery';
import { STORE_CATEGORIES } from '@/lib/storeEnum';

function CategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('selected'); // 백엔드 enum 값

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStoresInfiniteQuery(
    { category: selectedCategory ?? undefined },
    10,
  );

  const stores = data?.pages.flat() ?? [];

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

  const handleCategoryClick = (categoryEnum: string | null) => {
    if (categoryEnum) {
      router.push(`/category?selected=${categoryEnum}`);
    } else {
      router.push('/category');
    }
  };

  return (
    <>
      <Header showSearch showBack />
      <main className="flex-1">
        {/* 카테고리 탭 */}
        <div className="flex gap-2 overflow-x-auto border-b border-gray-100 px-4 py-3">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`flex-shrink-0 rounded-full px-4 py-2 text-sm ${
              selectedCategory === null
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
            }`}
          >
            전체
          </button>
          {STORE_CATEGORIES.map((category) => (
            <button
              key={category.enumValue}
              onClick={() => handleCategoryClick(category.enumValue)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm ${
                selectedCategory === category.enumValue
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
              }`}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>

        {/* 매장 목록 */}
        <div className="px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-400">매장을 불러오는 중...</p>
            </div>
          ) : stores.length > 0 ? (
            <>
              {stores.map((store) => (
                <StoreCard key={store.storeId} store={store} />
              ))}
              <div ref={sentinelRef} className="h-4" />
              {isFetchingNextPage && (
                <p className="py-4 text-center text-sm text-gray-400">불러오는 중...</p>
              )}
              {!hasNextPage && stores.length > 0 && (
                <p className="py-4 text-center text-xs text-gray-400">마지막 매장입니다.</p>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-gray-400">
                해당 카테고리의 매장이 없습니다
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

export default function Category() {
  return (
    <Suspense fallback={null}>
      <CategoryContent />
    </Suspense>
  );
}
