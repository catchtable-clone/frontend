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
} from 'lucide-react';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import ConfirmModal from '@/components/common/ConfirmModal';
import StarRating from '@/components/common/StarRating';
import { mockReservations } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { Reservation, ReservationStatus, Review } from '@/types/store';

const STATUS_CONFIG: Record<
  ReservationStatus,
  { label: string; color: string; bg: string }
> = {
  CONFIRMED: {
    label: '예약 확정',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  VISITED: { label: '방문 완료', color: 'text-green-600', bg: 'bg-green-50' },
  CANCELLED: { label: '취소됨', color: 'text-gray-500', bg: 'bg-gray-100' },
  NOSHOW: { label: '노쇼', color: 'text-red-600', bg: 'bg-red-50' },
};

function ReservationCard({
  reservation,
  onCancel,
  onWriteReview,
}: {
  reservation: Reservation;
  onCancel: (id: number) => void;
  onWriteReview: (reservation: Reservation) => void;
}) {
  const router = useRouter();
  const { label, color, bg } = STATUS_CONFIG[reservation.status];
  const isUpcoming = reservation.status === 'CONFIRMED';
  const isVisited = reservation.status === 'VISITED';
  const hasReview = !!reservation.reviewId;

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

      {/* 액션 버튼 */}
      {isUpcoming && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() =>
              router.push(
                `/reservation?storeId=${reservation.storeId}&date=${reservation.date}&time=${reservation.time}&changeFrom=${reservation.id}`,
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
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">
              <Check size={16} />
              <span>리뷰 작성 완료</span>
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

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [reservations, setReservations] =
    useState<Reservation[]>(mockReservations);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  // 리뷰 작성 상태
  const [reviewTarget, setReviewTarget] = useState<Reservation | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upcoming = reservations.filter((r) => r.status === 'CONFIRMED');
  const past = reservations.filter((r) => r.status !== 'CONFIRMED');
  const currentList = tab === 'upcoming' ? upcoming : past;

  const handleCancel = (id: number) => {
    setCancelTarget(id);
  };

  const confirmCancel = () => {
    if (cancelTarget === null) return;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === cancelTarget ? { ...r, status: 'CANCELLED' as const } : r,
      ),
    );
    setCancelTarget(null);
  };

  const openReviewModal = (reservation: Reservation) => {
    setReviewTarget(reservation);
    setReviewRating(0);
    setReviewContent('');
    setReviewImages([]);
  };

  const closeReviewModal = () => {
    reviewImages.forEach((url) => URL.revokeObjectURL(url));
    setReviewTarget(null);
    setReviewRating(0);
    setReviewContent('');
    setReviewImages([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 5 - reviewImages.length;
    const selected = Array.from(files).slice(0, remaining);

    const newUrls = selected.map((file) => URL.createObjectURL(file));
    setReviewImages((prev) => [...prev, ...newUrls].slice(0, 5));

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setReviewImages((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const submitReview = () => {
    if (!reviewTarget || reviewRating === 0) return;

    const newReview: Review = {
      id: reviews.length + 1,
      reservationId: reviewTarget.id,
      storeId: reviewTarget.storeId,
      rating: reviewRating,
      content: reviewContent,
      imageUrls: reviewImages,
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [...prev, newReview]);
    setReservations((prev) =>
      prev.map((r) =>
        r.id === reviewTarget.id ? { ...r, reviewId: newReview.id } : r,
      ),
    );
    closeReviewModal();
  };

  if (!isLoggedIn) {
    return (
      <>
        <Header title="예약" />
        <main className="flex flex-1 flex-col items-center gap-4 py-16">
          <p className="text-gray-500">로그인이 필요합니다</p>
          <button
            onClick={() => router.push('/login?redirect=/reservations')}
            className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            로그인하기
          </button>
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
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('upcoming')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'upcoming'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-400'
            }`}
          >
            예정된 예약 ({upcoming.length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === 'past'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-gray-400'
            }`}
          >
            지난 예약 ({past.length})
          </button>
        </div>

        {/* 예약 목록 */}
        <div className="flex flex-col gap-3 px-4 py-4">
          {currentList.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <CalendarDays size={40} className="text-gray-300" />
              <p className="text-sm text-gray-400">
                {tab === 'upcoming'
                  ? '예정된 예약이 없습니다'
                  : '지난 예약 이력이 없습니다'}
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
              />
            ))
          )}
        </div>
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

      {/* 리뷰 작성 모달 */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeReviewModal}
          />
          <div className="relative w-full max-w-[480px] rounded-t-2xl bg-white px-5 pb-5 pt-6">
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

            {/* 이미지 첨부 */}
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
                {reviewImages.map((src, idx) => (
                  <div key={idx} className="relative h-16 w-16 flex-shrink-0">
                    <img
                      src={src}
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

            {/* 제출 버튼 */}
            <button
              onClick={submitReview}
              disabled={reviewRating === 0}
              className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors ${
                reviewRating > 0
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-gray-300'
              }`}
            >
              리뷰 등록
            </button>
          </div>
        </div>
      )}
    </>
  );
}
