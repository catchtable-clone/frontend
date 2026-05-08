import api from '@/lib/axios';
import { unwrap } from '@/lib/apiUtils';

export interface CreateReviewRequest {
  reservationId: number;
  storeId: number;
  rating: number;
  content: string;
  images?: File[];
}

export interface ReviewResponse {
  reviewId: number;
  reservationId: number;
  storeId: number;
  storeName: string;
  userId: number;
  userNickname: string;
  star: number;
  content: string;
  reviewImage: string;
  createdAt: string;
  [key: string]: unknown;
}

/**
 * 방문 완료된 예약에 대해 리뷰를 작성한다.
 * 인증은 axios 인터셉터가 X-User-Id 헤더로 자동 첨부.
 */
export const createReview = async (data: CreateReviewRequest): Promise<void> => {
  const payload = {
    reservationId: data.reservationId,
    storeId: data.storeId,
    star: data.rating, // 백엔드 DTO 명세에 맞춰 rating 대신 star로 매핑
    content: data.content,
    // 백엔드에 MultipartFile 처리가 없어 실제 파일은 보내지 않음.
    // (추후 별도 S3 업로드 API가 추가되면 imageUrls 등으로 전달)
  };
  await api.post('/reviews', payload);
};

export const getMyReviews = async (): Promise<ReviewResponse[]> => {
  const response = await api.get('/reviews/me');
  return unwrap<ReviewResponse[]>(response, []);
};

export interface UpdateReviewRequest {
  star?: number;
  content?: string;
  reviewImage?: string;
}

export const updateReview = async (
  reviewId: number,
  data: UpdateReviewRequest,
): Promise<void> => {
  await api.patch(`/reviews/${reviewId}`, data);
};

export const deleteReview = async (reviewId: number): Promise<void> => {
  await api.delete(`/reviews/${reviewId}`);
};
