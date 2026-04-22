'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import StoreCard from '@/components/store/StoreCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FilterDropdown from '@/components/common/FilterDropdown';
import { mockCategories } from '@/lib/mockData';
import { searchStoresByName } from '@/lib/api/stores';
import { DISTRICT_LABEL } from '@/types/store';

type SortKey = 'default' | 'rating' | 'review';

const SORT_OPTIONS = [
  { key: 'default', label: '기본순' },
  { key: 'rating', label: '평점순' },
  { key: 'review', label: '리뷰순' },
];

const CATEGORY_OPTIONS = mockCategories.map((c) => ({
  key: c.name,
  label: `${c.icon} ${c.name}`,
}));

const REGION_OPTIONS = Object.values(DISTRICT_LABEL).map((r) => ({
  key: r,
  label: r,
}));

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('default');

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores', 'search', query],
    queryFn: () => searchStoresByName(query),
  });

  let results = stores;

  if (selectedCategory) {
    results = results.filter((s) => s.category === selectedCategory);
  }

  if (selectedRegion) {
    results = results.filter((s) => s.address.includes(selectedRegion));
  }

  if (sortKey === 'rating') {
    results = [...results].sort((a, b) => b.rating - a.rating);
  } else if (sortKey === 'review') {
    results = [...results].sort((a, b) => b.reviewCount - a.reviewCount);
  }

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
            options={REGION_OPTIONS}
            selected={selectedRegion}
            onSelect={setSelectedRegion}
          />
          <FilterDropdown
            label="기본순"
            options={SORT_OPTIONS}
            selected={sortKey === 'default' ? null : sortKey}
            onSelect={(key) => setSortKey((key as SortKey) || 'default')}
          />
        </div>

        {/* 검색 결과 */}
        <div className="px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : (
            <>
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
            </>
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
