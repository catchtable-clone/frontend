'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, MessageSquare } from 'lucide-react';
import Header from '@/components/common/Header';
import ConfirmModal from '@/components/common/ConfirmModal';
import StarRating from '@/components/common/StarRating';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { useMyReviewsQuery } from '@/lib/reviewQuery';
import { formatDateDot } from '@/lib/utils';

export default function MyReviewsPage() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const { data: reviews = [], isLoading } = useMyReviewsQuery(userId ?? 0);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget === null) return;
    // TODO: 백엔드 리뷰 삭제 API 연동
    setDeleteTarget(null);
  };

  if (isLoading) {
    return (
      <>
        <Header title="리뷰 관리" showBack />
        <main className="flex flex-1 items-center justify-center">
          <LoadingSpinner message="리뷰를 불러오는 중..." />
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="리뷰 관리" showBack />

      <main className="flex-1">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <MessageSquare size={40} className="text-gray-300" />
            <p className="text-sm text-gray-400">작성한 리뷰가 없습니다</p>
            <button
              onClick={() => router.push('/reservations')}
              className="mt-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
            >
              예약 내역 보기
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4 py-4">
            {reviews.map((review) => (
              <div
                key={review.reviewId}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => router.push(`/stores/${review.storeId}`)}
                    className="text-left"
                  >
                    <h3 className="text-base font-semibold text-gray-900">
                      {review.storeName}
                    </h3>
                  </button>
                  <button
                    onClick={() => handleDelete(review.reviewId)}
                    className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <StarRating rating={review.star ?? 0} />
                  <span className="text-xs text-gray-400">
                    {formatDateDot(review.createdAt)}
                  </span>
                </div>

                {review.content && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    {review.content}
                  </p>
                )}

                {review.reviewImage && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                        src={review.reviewImage}
                        alt="리뷰 이미지"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 삭제 확인 모달 */}
      {deleteTarget !== null && (
        <ConfirmModal
          title="리뷰를 삭제하시겠습니까?"
          message="삭제된 리뷰는 복구할 수 없습니다."
          confirmLabel="삭제하기"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
