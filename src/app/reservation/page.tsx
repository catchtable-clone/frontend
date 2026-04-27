'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  Clock,
  Users,
  Minus,
  Plus,
  Ticket,
  Check,
  ChevronRight,
  CheckCircle,
  Mail,
} from 'lucide-react';
import Header from '@/components/common/Header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import CenteredModal from '@/components/common/CenteredModal';
import BottomSheet from '@/components/common/BottomSheet';
import { mockCoupons } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';
import { useCreateReservationMutation, useUpdateReservationMutation } from '@/lib/reservationQuery';
import { useStoreDetailQuery } from '@/lib/storeQuery';
import type { Coupon } from '@/types/store';

function ReservationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const storeId = Number(searchParams.get('storeId'));
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const remainId = Number(searchParams.get('remainId'));
  const changeFrom = searchParams.get('changeFrom');
  const isChange = !!changeFrom;

  const { data: store, isLoading: isStoreLoading } = useStoreDetailQuery(String(storeId));

  const availableCoupons = mockCoupons.filter((c) => c.status === 'AVAILABLE');

  const { mutate: createReservation, isPending } = useCreateReservationMutation();
  const { mutate: updateReservation, isPending: isUpdatePending } = useUpdateReservationMutation();

  const [guestCount, setGuestCount] = useState(2);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showCouponSheet, setShowCouponSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (isStoreLoading) {
    return (
      <>
        <Header title="예약" showBack />
        <main className="flex flex-1 items-center justify-center">
          <LoadingSpinner message="매장 정보를 불러오는 중..." />
        </main>
      </>
    );
  }

  if (!store || !date || !time) {
    return (
      <>
        <Header title="예약" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">잘못된 접근입니다</p>
        </main>
      </>
    );
  }

  if (!remainId) {
    return (
      <>
        <Header title="예약" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">선택된 시간대의 정보(remainId)가 없습니다</p>
        </main>
      </>
    );
  }

  const handleConfirm = () => {
    if (isChange && changeFrom) {
      updateReservation(
        {
          reservationId: Number(changeFrom),
          userId: 1, // FIXME: 실제 로그인된 유저 ID (추후 AuthStore에서 연동)
          data: { remainId, guestCount }
        },
        {
          onSuccess: () => setShowSuccess(true),
          onError: (error) => {
            console.error('예약 변경 실패:', error);
            alert('예약 변경 중 오류가 발생했습니다.');
          },
        }
      );
    } else {
      createReservation(
        { storeId, date, time, guestCount, remainId },
        {
          onSuccess: () => setShowSuccess(true),
          onError: (error) => {
            console.error('예약 실패:', error);
            alert('예약 요청 중 오류가 발생했습니다.');
          },
        }
      );
    }
  };

  return (
    <>
      <Header title={isChange ? '예약 변경' : '예약 확인'} showBack />

      <main className="flex-1">
        {/* 매장 정보 */}
        <section className="border-b border-gray-100 px-4 py-5">
          <span className="text-xs text-gray-400">{store.category}</span>
          <h2 className="text-lg font-bold text-gray-900">{store.storeName}</h2>
        </section>

        {/* 예약 정보 */}
        <section className="border-b border-gray-100 px-4 py-5">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            예약 정보
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <CalendarDays size={18} className="text-gray-400" />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Clock size={18} className="text-gray-400" />
              <span>{time}</span>
            </div>
          </div>
        </section>

        {/* 인원 선택 */}
        <section className="border-b border-gray-100 px-4 py-5">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            인원 선택
          </h3>
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users size={18} className="text-gray-400" />
              <span>방문 인원</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGuestCount((prev) => Math.max(1, prev - 1))}
                disabled={guestCount <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:border-gray-200 disabled:text-gray-300"
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center text-lg font-semibold text-gray-900">
                {guestCount}
              </span>
              <button
                onClick={() => setGuestCount((prev) => Math.min(10, prev + 1))}
                disabled={guestCount >= 10}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:border-gray-200 disabled:text-gray-300"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* 쿠폰 선택 */}
        <section className="px-4 py-5">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            쿠폰 적용
          </h3>
          <button
            onClick={() => setShowCouponSheet(true)}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3.5 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Ticket size={18} className="text-gray-400" />
              {selectedCoupon ? (
                <div className="text-left">
                  <p className="text-sm font-medium text-orange-500">
                    {selectedCoupon.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedCoupon.discountRate}% 할인
                  </p>
                </div>
              ) : (
                <span className="text-sm text-gray-500">
                  사용 가능한 쿠폰 {availableCoupons.length}장
                </span>
              )}
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        </section>
      </main>

      {/* 예약 확정 버튼 */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-3">
        <button
          onClick={handleConfirm}
          disabled={isPending || isUpdatePending}
          className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors ${
            (isPending || isUpdatePending) ? 'cursor-not-allowed bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {(isPending || isUpdatePending) ? '예약 처리 중...' : isChange ? '예약 변경하기' : '예약 확정하기'}
        </button>
      </div>

      {/* 예약 성공 모달 */}
      {showSuccess && (
        <CenteredModal onClose={() => router.push('/reservations')}>
          <div className="text-center">
            <CheckCircle size={48} className="mx-auto text-green-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              예약이 {isChange ? '변경' : '확정'}되었습니다
            </h3>
            <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3 text-left">
              <p className="text-sm font-medium text-gray-900">{store.storeName}</p>
              <p className="mt-1 text-sm text-gray-600">
                {formatDate(date)} {time} / {guestCount}명
              </p>
              {selectedCoupon && (
                <p className="mt-1 text-sm text-orange-500">
                  {selectedCoupon.name} ({selectedCoupon.discountRate}% 할인)
                </p>
              )}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-gray-500">
              <Mail size={14} />
              <span>예약 확인 이메일이 발송됩니다</span>
            </div>
            <button
              onClick={() => router.push('/reservations')}
              className="mt-5 w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              예약 내역 보기
            </button>
          </div>
        </CenteredModal>
      )}

      {/* 쿠폰 선택 바텀시트 */}
      {showCouponSheet && (
        <BottomSheet onClose={() => setShowCouponSheet(false)}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            쿠폰 선택
          </h3>

          {availableCoupons.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <Ticket size={32} className="text-gray-300" />
                <p className="text-sm text-gray-400">
                  사용 가능한 쿠폰이 없습니다
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* 쿠폰 미적용 옵션 */}
                <button
                  onClick={() => {
                    setSelectedCoupon(null);
                    setShowCouponSheet(false);
                  }}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3.5 ${
                    !selectedCoupon
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm text-gray-700">쿠폰 미적용</span>
                  {!selectedCoupon && (
                    <Check size={18} className="text-orange-500" />
                  )}
                </button>

                {/* 쿠폰 목록 */}
                {availableCoupons.map((coupon) => {
                  const isSelected = selectedCoupon?.id === coupon.id;
                  return (
                    <button
                      key={coupon.id}
                      onClick={() => {
                        setSelectedCoupon(coupon);
                        setShowCouponSheet(false);
                      }}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3.5 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-left">
                        <p
                          className={`text-sm font-medium ${isSelected ? 'text-orange-600' : 'text-gray-900'}`}
                        >
                          {coupon.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs font-semibold text-orange-500">
                            {coupon.discountRate}% 할인
                          </span>
                          <span className="text-xs text-gray-400">
                            ~{coupon.expiresAt}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={18} className="text-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

          <button
            onClick={() => setShowCouponSheet(false)}
            className="mt-4 w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            닫기
          </button>
        </BottomSheet>
      )}
    </>
  );
}

export default function ReservationPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="예약 정보를 불러오는 중..." />}>
      <ReservationContent />
    </Suspense>
  );
}
