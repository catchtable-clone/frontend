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
  [key: string]: any;
}

/**
 * 방문 완료된 예약에 대해 리뷰를 작성하는 API 함수
 */
export const createReview = async (userId: number, data: CreateReviewRequest): Promise<void> => {
  // ReviewController가 @RequestBody를 사용하므로 JSON 형식으로 데이터를 전송합니다.
  const payload = {
    reservationId: data.reservationId,
    storeId: data.storeId,
    star: data.rating, // 백엔드 DTO 명세에 맞춰 rating 대신 star로 매핑합니다.
    content: data.content,
    // 백엔드 컨트롤러에 MultipartFile 처리 로직이 없으므로 실제 파일 객체는 전송하지 않습니다. 
    // (추후 별도 S3 이미지 업로드 API가 추가되면 imageUrls 배열 등으로 전달해야 합니다.)
  };

  await api.post('/reviews', payload, {
    params: { userId }, // 기존 백엔드 명세 규칙(Query Parameter)에 맞춤
  });
};

/**
 * 내가 작성한 리뷰 목록을 조회하는 API 함수
 */
export const getMyReviews = async (userId: number): Promise<ReviewResponse[]> => {
  const response = await api.get('/reviews/me', { params: { userId } });
  return unwrap<ReviewResponse[]>(response, []);
};