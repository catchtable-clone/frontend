'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import StoreCard from '@/components/store/StoreCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { mockStores, mockCategories } from '@/lib/mockData';
import { filterStores } from '@/lib/utils';

type SortKey = 'default' | 'rating' | 'review';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: '기본순' },
  { key: 'rating', label: '평점순' },
  { key: 'review', label: '리뷰순' },
];

// 지역(구) 추출
const REGIONS = Array.from(
  new Set(
    mockStores.map((s) => {
      const match = s.address.match(/서울\s+(\S+구)/);
      return match ? match[1] : '';
    }).filter(Boolean),
  ),
);

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  let results = filterStores(mockStores, query);

  // 카테고리 필터
  if (selectedCategory) {
    results = results.filter((s) => s.category === selectedCategory);
  }

  // 지역 필터
  if (selectedRegion) {
    results = results.filter((s) => s.address.includes(selectedRegion));
  }

  // 정렬
  if (sortKey === 'rating') {
    results = [...results].sort((a, b) => b.rating - a.rating);
  } else if (sortKey === 'review') {
    results = [...results].sort((a, b) => b.reviewCount - a.reviewCount);
  }

  const closeAll = () => {
    setShowCategoryDropdown(false);
    setShowRegionDropdown(false);
    setShowSortDropdown(false);
  };

  return (
    <>
      <Header showSearch showBack defaultQuery={query} />
      <main className="flex-1">
        {/* 필터 바 */}
        <div className="relative flex gap-2 border-b border-gray-100 px-4 py-2.5">
          {/* 카테고리 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowRegionDropdown(false);
                setShowSortDropdown(false);
              }}
              className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
                selectedCategory
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {selectedCategory || '카테고리'}
              <ChevronDown size={12} />
            </button>
            {showCategoryDropdown && (
              <div className="absolute left-0 top-full z-20 mt-1 max-h-60 w-32 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    closeAll();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50"
                >
                  전체
                </button>
                {mockCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      closeAll();
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 ${
                      selectedCategory === cat.name
                        ? 'font-medium text-orange-500'
                        : 'text-gray-600'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 지역 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRegionDropdown(!showRegionDropdown);
                setShowCategoryDropdown(false);
                setShowSortDropdown(false);
              }}
              className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
                selectedRegion
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {selectedRegion || '지역'}
              <ChevronDown size={12} />
            </button>
            {showRegionDropdown && (
              <div className="absolute left-0 top-full z-20 mt-1 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    setSelectedRegion(null);
                    closeAll();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50"
                >
                  전체
                </button>
                {REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => {
                      setSelectedRegion(region);
                      closeAll();
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 ${
                      selectedRegion === region
                        ? 'font-medium text-orange-500'
                        : 'text-gray-600'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 정렬 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowCategoryDropdown(false);
                setShowRegionDropdown(false);
              }}
              className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
                sortKey !== 'default'
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
              <ChevronDown size={12} />
            </button>
            {showSortDropdown && (
              <div className="absolute left-0 top-full z-20 mt-1 w-28 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {SORT_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSortKey(key);
                      closeAll();
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 ${
                      sortKey === key
                        ? 'font-medium text-orange-500'
                        : 'text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="px-4 py-3">
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
        </div>
      </main>
      <BottomNav />

      {/* 드롭다운 외부 클릭 닫기 */}
      {(showCategoryDropdown || showRegionDropdown || showSortDropdown) && (
        <div className="fixed inset-0 z-10" onClick={closeAll} />
      )}
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
