'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Clock,
  Users,
  X,
  Pencil,
  Check,
  Camera,
  CreditCard,
} from 'lucide-react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import ConfirmModal from '@/components/common/ConfirmModal';
import StarRating from '@/components/common/StarRating';
import BottomSheet from '@/components/common/BottomSheet';
import Tabs from '@/components/common/Tabs';
import LoginRequired from '@/components/common/LoginRequired';
import { formatDate } from '@/lib/utils';
import { useReservationsQuery, useCancelReservationMutation } from '@/lib/reservationQuery';
import { usePayment } from '@/hooks/usePayment';
import {
  useCreateReviewMutation,
  useMyReviewsQuery,
  useUpdateReviewMutation,
} from '@/lib/reviewQuery';
import { useMyVacanciesQuery, useCancelVacancyMutation } from '@/lib/vacancyQuery';
import { useAuthStore } from '@/stores/authStore';
import type { Reservation, ReservationStatus, VacancySubscription } from '@/types/store';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: '예약 대기', color: 'text-blue-600', bg: 'bg-blue-50' },
  CONFIRMED: {
    label: '예약 확정',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  VISITED: { label: '방문 완료', color: 'text-green-600', bg: 'bg-green-50' },
  CANCELED: { label: '취소됨', color: 'text-gray-500', bg: 'bg-gray-100' },
  NOSHOW: { label: '노쇼', color: 'text-red-600', bg: 'bg-red-50' },
};

function ReservationCard({
  reservation,
  onCancel,
  onWriteReview,
  onEditReview,
  isReviewed,
  onPayment,
  isPaymentProcessing,
}: {
  reservation: Reservation;
  onCancel: (id: number) => void;
  onWriteReview: (reservation: Reservation) => void;
  onEditReview: (reservation: Reservation) => void;
  isReviewed: boolean;
  onPayment: (reservation: Reservation) => void;
  isPaymentProcessing: boolean;
}) {
  const router = useRouter();
  const { label, color, bg } = STATUS_CONFIG[reservation.status] || STATUS_CONFIG['CONFIRMED'];
  const isPending = reservation.status === 'PENDING';
  const isUpcoming = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';
  const isVisited = reservation.status === 'VISITED';
  const hasReview = isReviewed;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* 상단: 매장명 + 상태 배지 */}
      <div className="flex items-start justify-between">
        <button
          onClick={() => router.push(`/stores/${reservation.storeId}`)}
          className="text-left"
        >
          <span className="text-xs text-gray-400">
            {reservation.storeCategory}
          </span>
          <h3 className="text-base font-semibold text-gray-900">
            {reservation.storeName}
          </h3>
        </button>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color} ${bg}`}
        >
          {label}
        </span>
      </div>

      {/* 예약 정보 */}
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarDays size={14} className="text-gray-400" />
          <span>{formatDate(reservation.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={14} className="text-gray-400" />
          <span>{reservation.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={14} className="text-gray-400" />
          <span>{reservation.guestCount}명</span>
        </div>
      </div>

      {/* 결제 진행 버튼 — PENDING 상태에서만 표시 */}
      {isPending && reservation.orderId && (
        <button
          onClick={() => onPayment(reservation)}
          disabled={isPaymentProcessing}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          <CreditCard size={15} />
          {isPaymentProcessing ? '결제 진행 중...' : '결제 진행하기 (10,000원)'}
        </button>
      )}

      {/* 액션 버튼 */}
      {isUpcoming && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() =>
              router.push(
              `/stores/${reservation.storeId}?changeFrom=${reservation.id}`
              )
            }
            className="flex-1 rounded-lg border border-blue-200 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50"
          >
            예약 변경
          </button>
          <button
            onClick={() => onCancel(reservation.id)}
            className="flex-1 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
          >
            예약 취소
          </button>
        </div>
      )}

      {isVisited && (
        <div className="mt-4">
          {hasReview ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">
                <Check size={16} />
                <span>리뷰 작성 완료</span>
              </div>
              <button
                onClick={() => onEditReview(reservation)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={14} />
                리뷰 수정
              </button>
            </div>
          ) : (
            <button
              onClick={() => onWriteReview(reservation)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              <Pencil size={14} />
              리뷰 작성
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReservationsPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const isLoggedIn = !!accessToken;

  const [tab, setTab] = useState<'upcoming' | 'visited' | 'canceled' | 'vacancy'>('upcoming');

  const userId = useAuthStore((s) => s.userId) ?? 0;
  const { data: reservations = [], isLoading } = useReservationsQuery();
  const { mutate: cancelReservation } = useCancelReservationMutation();
  const { processPayment, isProcessing: isPaymentProcessing } = usePayment();
  const { data: vacancies = [], isLoading: isVacancyLoading } = useMyVacanciesQuery();
  const { mutate: cancelVacancy } = useCancelVacancyMutation();
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [vacancyCancelTarget, setVacancyCancelTarget] = useState<number | null>(null);

  // 리뷰 작성/수정 상태
  const [reviewTarget, setReviewTarget] = useState<Reservation | null>(null);
  const [reviewMode, setReviewMode] = useState<'create' | 'edit'>('create');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewImages, setReviewImages] = useState<{ file: File; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createReview, isPending: isCreatePending } = useCreateReviewMutation();
  const { mutate: updateReview, isPending: isUpdatePending } = useUpdateReviewMutation();
  const isReviewPending = isCreatePending || isUpdatePending;

  // 내가 작성한 리뷰 목록을 불러와서 이미 리뷰를 작성한 예약인지 확인합니다.
  const { data: myReviews = [] } = useMyReviewsQuery();

  // reservationId → 리뷰 객체 Map (수정 시 prefill용)
  const reviewByReservationId = new Map(myReviews.map((r) => [r.reservationId, r]));
  const reviewedReservationIds = new Set(reviewByReservationId.keys());

  const upcoming = reservations.filter((r) => r.status === 'PENDING' || r.status === 'CONFIRMED');
  const visited = reservations.filter((r) => r.status === 'VISITED');
  const canceled = reservations.filter((r) => r.status === 'CANCELED' || r.status === 'NOSHOW');
  const currentList = tab === 'upcoming' ? upcoming : tab === 'visited' ? visited : canceled;

  const handleCancel = (id: number) => {
    setCancelTarget(id);
  };

  const handlePayment = (reservation: Reservation) => {
    if (!reservation.orderId) return;
    processPayment({ reservationId: reservation.id, orderId: reservation.orderId, amount: 10000 });
  };

  const confirmCancel = () => {
    if (cancelTarget === null) return;
    cancelReservation(cancelTarget, {
      onSuccess: () => {
        toast.success('예약이 취소되었습니다.');
        setCancelTarget(null);
      },
      onError: () => {
        // 토스트는 axios 인터셉터에서 처리됨
        setCancelTarget(null);
      },
    });
  };

  const openReviewModal = (reservation: Reservation) => {
    setReviewMode('create');
    setEditingReviewId(null);
    setReviewTarget(reservation);
    setReviewRating(0);
    setReviewContent('');
    setReviewImages([]);
  };

  const openEditReviewModal = (reservation: Reservation) => {
    const existing = reviewByReservationId.get(reservation.id);
    if (!existing) return;
    setReviewMode('edit');
    setEditingReviewId(existing.reviewId);
    setReviewTarget(reservation);
    setReviewRating(existing.star ?? 0);
    setReviewContent(existing.content ?? '');
    setReviewImages([]);
  };

  const closeReviewModal = () => {
    reviewImages.forEach((img) => URL.revokeObjectURL(img.url));
    setReviewTarget(null);
    setReviewMode('create');
    setEditingReviewId(null);
    setReviewRating(0);
    setReviewContent('');
    setReviewImages([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 5 - reviewImages.length;
    const selected = Array.from(files).slice(0, remaining);

    const newImages = selected.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setReviewImages((prev) => [...prev, ...newImages].slice(0, 5));

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setReviewImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const submitReview = () => {
    if (!reviewTarget || reviewRating === 0 || !userId) return;

    if (reviewMode === 'edit' && editingReviewId !== null) {
      updateReview(
        {
          reviewId: editingReviewId,
          data: { star: reviewRating, content: reviewContent },
        },
        {
          onSuccess: () => {
            toast.success('리뷰가 수정되었습니다.');
            closeReviewModal();
          },
        },
      );
      return;
    }

    createReview(
      {
        reservationId: reviewTarget.id,
        storeId: reviewTarget.storeId,
        rating: reviewRating,
        content: reviewContent,
        images: reviewImages.map((img) => img.file),
      },
      {
        onSuccess: () => {
          toast.success('리뷰가 등록되었습니다.');
          closeReviewModal();
        },
        onError: (error: any) => {
          // 일반 에러는 axios 인터셉터가 토스트로 처리. 여기서는 모달 닫기만 결정.
          if (error?.response?.data?.code === 'REVIEW_ALREADY_EXISTS') {
            closeReviewModal();
          }
        },
      }
    );
  };

  if (!isLoggedIn) {
    return (
      <>
        <Header title="예약" />
        <main className="flex-1">
          <LoginRequired redirectTo="/reservations" />
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header title="예약" />

      <main className="flex-1">
        {/* 탭 */}
        <Tabs
          items={[
            { key: 'upcoming', label: `방문 예정 (${upcoming.length})` },
            { key: 'visited', label: `방문 완료 (${visited.length})` },
            { key: 'canceled', label: `취소/노쇼 (${canceled.length})` },
            { key: 'vacancy', label: `빈자리 알림 (${vacancies.length})` },
          ]}
          activeKey={tab}
          onChange={(key) => setTab(key as 'upcoming' | 'visited' | 'canceled' | 'vacancy')}
        />

        {/* 예약 목록 */}
        {tab !== 'vacancy' && (
          <div className="flex flex-col gap-3 px-4 py-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                <p className="mt-4 text-sm text-gray-400">예약 내역을 불러오는 중...</p>
              </div>
            ) : currentList.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <CalendarDays size={40} className="text-gray-300" />
                <p className="text-sm text-gray-400">
                  {tab === 'upcoming'
                    ? '방문 예정인 예약이 없습니다'
                    : tab === 'visited'
                      ? '방문 완료된 내역이 없습니다'
                      : '취소/노쇼된 예약이 없습니다'}
                </p>
                {tab === 'upcoming' && (
                  <button
                    onClick={() => router.push('/')}
                    className="mt-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
                  >
                    매장 둘러보기
                  </button>
                )}
              </div>
            ) : (
              currentList.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onCancel={handleCancel}
                  onWriteReview={openReviewModal}
                  onEditReview={openEditReviewModal}
                  isReviewed={reviewedReservationIds.has(reservation.id)}
                  onPayment={handlePayment}
                  isPaymentProcessing={isPaymentProcessing}
                />
              ))
            )}
          </div>
        )}

        {/* 빈자리 알림 */}
        {tab === 'vacancy' && (
          <div className="flex flex-col gap-3 px-4 py-4">
            {isVacancyLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                <p className="mt-4 text-sm text-gray-400">알림 내역을 불러오는 중...</p>
              </div>
            ) : vacancies.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <CalendarDays size={40} className="text-gray-300" />
                <p className="text-sm text-gray-400">
                  구독 중인 빈자리 알림이 없습니다
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
                >
                  매장 둘러보기
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500">
                  빈자리가 발생하면 알림을 보내드립니다
                </p>
                {vacancies.map((sub) => (
                  <div
                    key={sub.vacancyId}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between">
                      <button
                        onClick={() => sub.storeId && router.push(`/stores/${sub.storeId}`)}
                        className="text-left"
                      >
                        <span className="text-xs text-gray-400">
                          {sub.storeCategory || '식당'}
                        </span>
                        <h3 className="text-base font-semibold text-gray-900">
                          {sub.storeName}
                        </h3>
                      </button>
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                        구독 중
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays size={14} className="text-gray-400" />
                        <span>{formatDate(sub.remainDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} className="text-gray-400" />
                        <span>{sub.remainTime}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => sub.storeId && router.push(`/stores/${sub.storeId}`)}
                        className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        매장 보기
                      </button>
                      <button
                        onClick={() => setVacancyCancelTarget(sub.vacancyId)}
                        className="flex-1 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                      >
                        구독 취소
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </main>

      <BottomNav />

      {/* 취소 확인 모달 */}
      {cancelTarget !== null && (
        <ConfirmModal
          title="예약을 취소하시겠습니까?"
          message="취소된 예약은 복구할 수 없습니다."
          confirmLabel="취소하기"
          onConfirm={confirmCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      {/* 빈자리 구독 취소 모달 */}
      {vacancyCancelTarget !== null && (
        <ConfirmModal
          title="빈자리 알림을 취소하시겠습니까?"
          message="취소하면 해당 시간대의 빈자리 알림을 받을 수 없습니다."
          confirmLabel="취소하기"
          onConfirm={() => {
            if (vacancyCancelTarget) {
              cancelVacancy(vacancyCancelTarget, {
                onSuccess: () => {
                  toast.success('빈자리 알림이 취소되었습니다.');
                  setVacancyCancelTarget(null);
                },
                onError: () => setVacancyCancelTarget(null),
              });
            }
          }}
          onCancel={() => setVacancyCancelTarget(null)}
        />
      )}

      {/* 리뷰 작성/수정 모달 */}
      {reviewTarget && (
        <BottomSheet onClose={closeReviewModal}>
          <button
            onClick={closeReviewModal}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

            {/* 매장 정보 */}
            <div className="mb-5">
              <span className="text-xs text-gray-400">
                {reviewTarget.storeCategory}
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                {reviewTarget.storeName}
              </h3>
              <p className="mt-0.5 text-sm text-gray-500">
                {formatDate(reviewTarget.date)} {reviewTarget.time} 방문
              </p>
            </div>

            {/* 별점 */}
            <div className="mb-5 flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-gray-700">
                매장은 어떠셨나요?
              </p>
              <StarRating rating={reviewRating} size={32} onRate={setReviewRating} />
              <p className="text-xs text-gray-400">
                {reviewRating === 0 && '별점을 선택해주세요'}
                {reviewRating === 1 && '별로예요'}
                {reviewRating === 2 && '그저 그래요'}
                {reviewRating === 3 && '보통이에요'}
                {reviewRating === 4 && '좋았어요'}
                {reviewRating === 5 && '최고예요!'}
              </p>
            </div>

            {/* 리뷰 내용 */}
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="방문 경험을 자유롭게 작성해주세요 (선택)"
              rows={4}
              className="mb-4 w-full resize-none rounded-lg border border-gray-200 px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
            />

            {/* 이미지 첨부 (신규 작성 시에만) */}
            {reviewMode === 'create' && (
            <div className="mb-5">
              <div className="flex items-center gap-3">
                {reviewImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-400"
                  >
                    <Camera size={18} />
                    <span className="text-[10px]">
                      {reviewImages.length}/5
                    </span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {reviewImages.map((img, idx) => (
                  <div key={idx} className="relative h-16 w-16 flex-shrink-0">
                    <img
                      src={img.url}
                      alt={`리뷰 이미지 ${idx + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* 제출 버튼 */}
            <button
              onClick={submitReview}
              disabled={reviewRating === 0 || isReviewPending}
              className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors ${
                reviewRating > 0 && !isReviewPending
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-gray-300'
              }`}
            >
              {isReviewPending
                ? reviewMode === 'edit'
                  ? '수정 중...'
                  : '등록 중...'
                : reviewMode === 'edit'
                  ? '리뷰 수정'
                  : '리뷰 등록'}
            </button>
        </BottomSheet>
      )}
    </>
  );
}
