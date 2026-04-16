import Link from 'next/link';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import StoreCard from '@/components/store/StoreCard';
import { mockCategories, mockStores } from '@/lib/mockData';

export default function Home() {
  const popularStores = mockStores.slice(0, 3);

  return (
    <>
      <Header showSearch />
      <main className="flex-1">
        {/* 카테고리 */}
        <section className="border-b border-gray-100 px-4 py-4">
          <div className="grid grid-cols-4 gap-4">
            {mockCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category?selected=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center gap-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-xl">
                  {category.icon}
                </div>
                <span className="text-xs text-gray-600">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 인기 매장 */}
        <section className="border-b border-gray-100 px-4 py-4">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            인기 매장
          </h2>
          <div className="flex gap-3 overflow-x-auto">
            {popularStores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.id}`}
                className="flex w-36 flex-shrink-0 flex-col gap-2"
              >
                <div className="h-24 w-full rounded-lg bg-gray-200" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {store.name}
                  </p>
                  <p className="text-xs text-gray-500">{store.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 내 주변 매장 */}
        <section className="px-4 py-4">
          <h2 className="mb-1 text-base font-semibold text-gray-900">
            내 주변 매장
          </h2>
          <div>
            {mockStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
