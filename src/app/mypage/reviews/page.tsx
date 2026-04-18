'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, MessageSquare } from 'lucide-react';
import Header from '@/components/common/Header';
import ConfirmModal from '@/components/common/ConfirmModal';
import StarRating from '@/components/common/StarRating';
import { mockReviews, mockStores } from '@/lib/mockData';
import { formatDateDot } from '@/lib/utils';
import type { Review } from '@/types/store';

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (deleteTarget === null) return;
    setReviews((prev) => prev.filter((r) => r.id !== deleteTarget));
    setDeleteTarget(null);
  };

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
            {reviews.map((review) => {
              const store = mockStores.find((s) => s.id === review.storeId);
              return (
                <div
                  key={review.id}
                  className="rounded-xl border border-gray-200 bg-white p-4"
                >
                  {/* 매장 정보 + 삭제 */}
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() =>
                        router.push(`/stores/${review.storeId}`)
                      }
                      className="text-left"
                    >
                      <span className="text-xs text-gray-400">
                        {store?.category}
                      </span>
                      <h3 className="text-base font-semibold text-gray-900">
                        {store?.name}
                      </h3>
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* 별점 + 날짜 */}
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">
                      {formatDateDot(review.createdAt)}
                    </span>
                  </div>

                  {/* 리뷰 내용 */}
                  {review.content && (
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                      {review.content}
                    </p>
                  )}

                  {/* 리뷰 이미지 */}
                  {review.imageUrls.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {review.imageUrls.map((url, idx) => (
                        <div key={idx} className="relative h-20 w-20 flex-shrink-0">
                          <Image
                            src={url}
                            alt={`리뷰 이미지 ${idx + 1}`}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
