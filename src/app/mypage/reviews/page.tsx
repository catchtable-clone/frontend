'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, Trash2, MessageSquare, X } from 'lucide-react';
import Header from '@/components/common/Header';
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
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= review.rating
                              ? 'fill-orange-400 text-orange-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative mx-4 w-full max-w-[360px] rounded-2xl bg-white p-6">
            <button
              onClick={() => setDeleteTarget(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              리뷰를 삭제하시겠습니까?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              삭제된 리뷰는 복구할 수 없습니다.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                돌아가기
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
