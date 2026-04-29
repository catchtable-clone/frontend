'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ticket } from 'lucide-react';
import Header from '@/components/common/Header';
import Tabs from '@/components/common/Tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { getMyCoupons } from '@/lib/api/coupons';
import { formatDateDot } from '@/lib/utils';
import type { Coupon, CouponStatus } from '@/types/store';

const STATUS_LABEL: Record<CouponStatus, string> = {
  AVAILABLE: '사용 가능',
  USED: '사용 완료',
  EXPIRED: '기간 만료',
};

function CouponCard({ coupon }: { coupon: Coupon }) {
  const isAvailable = coupon.status === 'AVAILABLE';

  return (
    <div
      className={`overflow-hidden rounded-xl border ${
        isAvailable ? 'border-sky-200 bg-white' : 'border-gray-200 bg-gray-50'
      }`}
    >
      {/* 상단: 할인율 */}
      <div
        className={`px-4 py-3 ${
          isAvailable ? 'bg-sky-500' : 'bg-gray-400'
        }`}
      >
        <p className="text-2xl font-bold text-white">
          {coupon.discountRate}%
          <span className="ml-1 text-sm font-normal">할인</span>
        </p>
      </div>

      {/* 하단: 쿠폰 정보 */}
      <div className="px-4 py-3">
        <p
          className={`text-sm font-medium ${
            isAvailable ? 'text-gray-900' : 'text-gray-500'
          }`}
        >
          {coupon.name}
        </p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            ~{formatDateDot(coupon.expiresAt)} 까지
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              isAvailable
                ? 'bg-sky-50 text-sky-600'
                : coupon.status === 'USED'
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-red-50 text-red-500'
            }`}
          >
            {STATUS_LABEL[coupon.status]}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MyCouponsPage() {
  const [tab, setTab] = useState<'available' | 'used'>('available');

  const {
    data: coupons = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['coupons', 'me'],
    queryFn: getMyCoupons,
  });

  const available = coupons.filter((c) => c.status === 'AVAILABLE');
  const used = coupons.filter((c) => c.status !== 'AVAILABLE');
  const currentList = tab === 'available' ? available : used;

  return (
    <>
      <Header title="쿠폰 관리" showBack />

      <main className="flex-1">
        {/* 탭 */}
        <Tabs
          items={[
            { key: 'available', label: `사용 가능 (${available.length})` },
            { key: 'used', label: `사용 완료/만료 (${used.length})` },
          ]}
          activeKey={tab}
          onChange={(key) => setTab(key as 'available' | 'used')}
        />

        {/* 쿠폰 목록 */}
        <div className="flex flex-col gap-3 px-4 py-4">
          {isLoading ? (
            <LoadingSpinner message="쿠폰을 불러오는 중..." />
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <p className="text-sm text-red-500">쿠폰을 불러오지 못했습니다</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <Ticket size={40} className="text-gray-300" />
              <p className="text-sm text-gray-400">
                {tab === 'available'
                  ? '사용 가능한 쿠폰이 없습니다'
                  : '사용 완료/만료된 쿠폰이 없습니다'}
              </p>
            </div>
          ) : (
            currentList.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))
          )}
        </div>
      </main>
    </>
  );
}
