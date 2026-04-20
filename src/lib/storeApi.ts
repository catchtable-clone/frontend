import api from '@/lib/axios';
import { StoreDetail, Menu, Review } from '@/types/store';

/**
 * 특정 ID를 가진 매장의 상세 정보를 조회하는 API 함수
 * @param storeId - 조회할 매장의 ID
 * @returns 매장 상세 정보
 */
export const getStoreDetail = async (storeId: string): Promise<StoreDetail> => {
  const response = await api.get(`/stores/${storeId}`);
  
  // 브라우저 개발자 도구(F12) 콘솔에서 실제 응답 구조를 직접 확인하기 위한 임시 로그
  console.log('백엔드 API 응답 원본:', response.data);

  // 백엔드가 공통 응답 형식(예: { status: 200, data: {...} })으로 감싸서 보낼 경우 알맹이 추출
  const storeData = response.data.data || response.data.result || response.data;
  
  return storeData as StoreDetail;
};

/**
 * 특정 매장의 메뉴 목록을 조회하는 API 함수
 * @param storeId - 조회할 매장의 ID
 */
export const getStoreMenus = async (storeId: string): Promise<Menu[]> => {
  // 백엔드 API 설계에 맞춰 정확한 주소로 변경합니다.
  const response = await api.get(`/stores/${storeId}/menu`);
  console.log('메뉴 API 응답 원본:', response.data);
  const menuData = response.data.data || response.data.result || response.data;
  return menuData as Menu[];
};

/**
 * 특정 매장의 리뷰 목록을 조회하는 API 함수
 * @param storeId - 조회할 매장의 ID
 */
export const getStoreReviews = async (storeId: string): Promise<Review[]> => {
  // /stores/{id}/reviews (GET) 은 405 에러가 발생하므로, 도메인 주도 REST 규칙에 맞춰 우회 호출합니다.
  // 첫 번째 패턴 시도 후 404 발생 시 두 번째 패턴으로 자동 재시도
  const response = await api.get(`/reviews/store/${storeId}`)
    .catch(() => api.get(`/reviews`, { params: { storeId } }));
  
  console.log('리뷰 API 응답 원본:', response.data);
  const reviewData = response.data.data || response.data.result || response.data;
  return reviewData as Review[];
};