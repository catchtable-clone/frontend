'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import StoreCard from '@/components/store/StoreCard';
import { mockCategories, mockStores } from '@/lib/mockData';

function CategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('selected');

  const filteredStores = selectedCategory
    ? mockStores.filter((store) => store.category === selectedCategory)
    : mockStores;

  const handleCategoryClick = (categoryName: string | null) => {
    if (categoryName) {
      router.push(`/category?selected=${encodeURIComponent(categoryName)}`);
    } else {
      router.push('/category');
    }
  };

  return (
    <>
      <Header showSearch />
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
          {mockCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.name)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm ${
                selectedCategory === category.name
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>

        {/* 매장 목록 */}
        <div className="px-4">
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))
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
