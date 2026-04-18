'use client';

import { useState } from 'react';
import { Ticket } from 'lucide-react';
import Header from '@/components/common/Header';
import { mockCoupons } from '@/lib/mockData';
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
  const coupons = mockCoupons;

  const available = coupons.filter((c) => c.status === 'AVAILABLE');
  const used = coupons.filter((c) => c.status !== 'AVAILABLE');
  const currentList = tab === 'available' ? available : used;

  return (
    <>
      <Header title="쿠폰 관리" showBack />

      <main className="flex-1">
        {/* 탭 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('available')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'available'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-400'
            }`}
          >
            사용 가능 ({available.length})
          </button>
          <button
            onClick={() => setTab('used')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'used'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-400'
            }`}
          >
            사용 완료/만료 ({used.length})
          </button>
        </div>

        {/* 쿠폰 목록 */}
        <div className="flex flex-col gap-3 px-4 py-4">
          {currentList.length === 0 ? (
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
