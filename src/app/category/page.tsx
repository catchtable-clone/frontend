'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import StoreCard from '@/components/store/StoreCard';
import { useStoresInfiniteQuery } from '@/lib/storeQuery';
import { STORE_CATEGORIES, STORE_DISTRICTS, toDistrictLabel } from '@/lib/storeEnum';
import { useDragScroll } from '@/hooks/useDragScroll';

function CategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('selected'); // 백엔드 enum 값
  const selectedDistrict = searchParams.get('district');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStoresInfiniteQuery(
    {
      category: selectedCategory || undefined,
      district: selectedDistrict || undefined,
    },
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

  const buildHref = (category: string | null, district: string | null) => {
    const params = new URLSearchParams();
    if (category) params.set('selected', category);
    if (district) params.set('district', district);
    const qs = params.toString();
    return qs ? `/category?${qs}` : '/category';
  };

  const handleCategoryClick = useCallback((categoryEnum: string | null) => {
    router.push(buildHref(categoryEnum, selectedDistrict));
  }, [router, selectedDistrict]);

  const handleDistrictClick = useCallback((districtEnum: string | null) => {
    router.push(buildHref(selectedCategory, districtEnum));
    setIsDistrictOpen(false);
  }, [router, selectedCategory]);

  const categoryScrollRef = useDragScroll<HTMLDivElement>();

  const [isDistrictOpen, setIsDistrictOpen] = useState(false);
  const districtDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDistrictOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        districtDropdownRef.current &&
        !districtDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDistrictOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDistrictOpen]);

  return (
    <>
      <Header showSearch showBack />
      <main className="flex-1">
        {/* 카테고리 탭 */}
        <div
          ref={categoryScrollRef}
          className="flex gap-2 overflow-x-auto border-b border-gray-100 px-4 py-3 select-none"
        >
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

        {/* 지역 필터 (드롭다운) */}
        <div className="border-b border-gray-100 px-4 py-3">
          <div ref={districtDropdownRef} className="relative inline-block">
            <button
              onClick={() => setIsDistrictOpen((v) => !v)}
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm ${
                selectedDistrict
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
              }`}
            >
              <span>{selectedDistrict ? toDistrictLabel(selectedDistrict) : '지역 선택'}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${isDistrictOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDistrictOpen && (
              <div className="absolute left-0 top-full z-20 mt-2 max-h-72 w-44 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  onClick={() => handleDistrictClick(null)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                    selectedDistrict === null ? 'font-semibold text-orange-500' : 'text-gray-700'
                  }`}
                >
                  <span>전체 지역</span>
                  {selectedDistrict === null && <Check size={16} className="text-orange-500" />}
                </button>
                {STORE_DISTRICTS.map((district) => {
                  const isActive = selectedDistrict === district.enumValue;
                  return (
                    <button
                      key={district.enumValue}
                      onClick={() => handleDistrictClick(district.enumValue)}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${
                        isActive ? 'font-semibold text-orange-500' : 'text-gray-700'
                      }`}
                    >
                      <span>{district.label}</span>
                      {isActive && <Check size={16} className="text-orange-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
