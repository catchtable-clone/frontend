import api from '@/lib/axios';
import { StoreDetail, Menu, Review, StoreRemain } from '@/types/store';

/**
 * 특정 ID를 가진 매장의 상세 정보를 조회하는 API 함수
 * @param storeId - 조회할 매장의 ID
 * @returns 매장 상세 정보
 */
export const getStoreDetail = async (storeId: string): Promise<StoreDetail> => {
  const response = await api.get(`/stores/${storeId}`);

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
  try {
    const response = await api.get(`/reviews/store/${storeId}`);
    return (response.data.data || response.data.result || response.data) as Review[];
  } catch (error: any) {
    // 404(Not Found) 또는 405(Method Not Allowed) 에러일 경우에만 우회 호출 시도
    if (error.response && (error.response.status === 404 || error.response.status === 405)) {
      const fallbackResponse = await api.get(`/reviews`, { params: { storeId } });
      return (fallbackResponse.data.data || fallbackResponse.data.result || fallbackResponse.data) as Review[];
    }
    throw error;
  }
};

/**
 * 특정 매장의 특정 날짜 예약 시간대 목록을 조회하는 API 함수
 * @param storeId - 매장 ID
 * @param date - 조회할 날짜 (YYYY-MM-DD)
 */
export const getStoreTimes = async (storeId: string, date: string): Promise<StoreRemain[]> => {
  // 백엔드 명세에 맞춰 /remains 엔드포인트에 쿼리 파라미터로 storeId와 date를 전달합니다.
  const response = await api.get(`/remains`, { params: { storeId, date } });
  return (response.data.data || response.data.result || response.data) as StoreRemain[];
};