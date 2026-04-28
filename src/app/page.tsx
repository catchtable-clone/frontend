'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Ticket, Clock, X, Star } from 'lucide-react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import StoreCard from '@/components/store/StoreCard';
import CenteredModal from '@/components/common/CenteredModal';
import { usePopularStoresQuery, useNearbyStoresInfiniteQuery } from '@/lib/storeQuery';
import { STORE_CATEGORIES } from '@/lib/storeEnum';

// 강남역 좌표 (위치 정보 미공유 시 기준점)
const GANGNAM_LAT = 37.4979;
const GANGNAM_LNG = 127.0276;

export default function Home() {
  const { data: popularStores = [], isLoading: isPopularLoading } = usePopularStoresQuery(10);
  const {
    data: nearbyData,
    isLoading: isNearbyLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNearbyStoresInfiniteQuery(GANGNAM_LAT, GANGNAM_LNG, 10);

  const nearbyStores = nearbyData?.pages.flat() ?? [];

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [claimed, setClaimed] = useState(false);

  // 무한 스크롤 트리거 (IntersectionObserver)
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

  const handleClaim = () => {
    setClaimed(true);
  };

  return (
    <>
      <Header showLogo />
      <main className="flex-1">
        {/* 쿠폰 발급 배너 */}
        <section className="px-4 pt-3 pb-1">
          <button
            onClick={() => {
              setClaimed(false);
              setShowCouponModal(true);
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-3.5 text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Ticket size={20} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">오늘의 선착순 쿠폰</p>
              <p className="text-xs text-orange-100">
                매일 오전 10시, 선착순 100명 15% 할인!
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-orange-100">
              <Clock size={12} />
              <span>10:00</span>
            </div>
          </button>
        </section>

        {/* 카테고리 */}
        <section className="border-b border-gray-100 px-4 py-2">
          <div className="grid grid-cols-4 gap-1">
            {STORE_CATEGORIES.map((category) => (
              <Link
                key={category.enumValue}
                href={`/category?selected=${category.enumValue}`}
                className="flex flex-col items-center gap-1 rounded-xl p-2 transition-colors hover:bg-gray-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-xl">
                  {category.icon}
                </div>
                <span className="text-xs text-gray-600">{category.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 인기 매장 */}
        <section className="border-b border-gray-100 px-4 py-4">
          <h2 className="mb-3 text-base font-semibold text-gray-900">인기 매장</h2>
          {isPopularLoading ? (
            <p className="py-4 text-center text-sm text-gray-400">매장을 불러오는 중...</p>
          ) : popularStores.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {popularStores.map((store) => (
                <Link
                  key={store.storeId}
                  href={`/stores/${store.storeId}`}
                  className="flex w-36 flex-shrink-0 flex-col gap-2 rounded-xl p-2 transition-colors hover:bg-gray-50"
                >
                  <div className="relative h-24 w-full overflow-hidden rounded-lg bg-gray-200">
                    <img
                      src={store.storeImage || '/images/ready_image.png'}
                      alt={store.storeName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/ready_image.png';
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {store.storeName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <Star size={11} className="fill-orange-400 text-orange-400" />
                      <span>{store.averageStar.toFixed(1)}</span>
                      <span className="text-gray-300">·</span>
                      <span>리뷰 {store.reviewCount}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-gray-400">등록된 매장이 없습니다.</p>
          )}
        </section>

        {/* 내 주변 매장 */}
        <section className="px-4 py-4">
          <h2 className="mb-1 text-base font-semibold text-gray-900">내 주변 매장</h2>
          <p className="mb-2 text-xs text-gray-400">강남역 기준 가까운 매장</p>
          {isNearbyLoading ? (
            <p className="py-4 text-center text-sm text-gray-400">매장을 불러오는 중...</p>
          ) : nearbyStores.length > 0 ? (
            <>
              <div>
                {nearbyStores.map((store) => (
                  <StoreCard key={store.storeId} store={store} />
                ))}
              </div>
              {/* 무한 스크롤 sentinel */}
              <div ref={sentinelRef} className="h-4" />
              {isFetchingNextPage && (
                <p className="py-4 text-center text-sm text-gray-400">불러오는 중...</p>
              )}
              {!hasNextPage && nearbyStores.length > 0 && (
                <p className="py-4 text-center text-xs text-gray-400">마지막 매장입니다.</p>
              )}
            </>
          ) : (
            <p className="py-4 text-center text-sm text-gray-400">등록된 매장이 없습니다.</p>
          )}
        </section>
      </main>
      <BottomNav />

      {/* 쿠폰 발급 모달 */}
      {showCouponModal && (
        <CenteredModal onClose={() => setShowCouponModal(false)}>
          <button
            onClick={() => setShowCouponModal(false)}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
              <Ticket size={28} className="text-orange-500" />
            </div>

            {!claimed ? (
              <>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  선착순 할인 쿠폰
                </h3>
                <div className="mt-3 rounded-lg bg-orange-50 px-4 py-3">
                  <p className="text-2xl font-bold text-orange-500">15% 할인</p>
                  <p className="mt-1 text-xs text-gray-500">
                    전 매장 사용 가능 · 유효기간 30일
                  </p>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  잔여 수량: 73 / 100
                </p>
                <button
                  onClick={handleClaim}
                  className="mt-4 w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  쿠폰 받기
                </button>
              </>
            ) : (
              <>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  쿠폰이 발급되었습니다!
                </h3>
                <div className="mt-3 rounded-lg bg-green-50 px-4 py-3">
                  <p className="text-2xl font-bold text-green-500">15% 할인</p>
                  <p className="mt-1 text-xs text-gray-500">
                    마이페이지 &gt; 쿠폰 관리에서 확인하세요
                  </p>
                </div>
                <button
                  onClick={() => setShowCouponModal(false)}
                  className="mt-4 w-full rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  확인
                </button>
              </>
            )}
          </div>
        </CenteredModal>
      )}
    </>
  );
}
