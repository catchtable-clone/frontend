import api from '@/lib/axios';
import { StoreDetail, StoreSummary, Menu, Review, StoreRemain } from '@/types/store';

/**
 * 백엔드 ApiResponse 래핑(`{ status, message, data }`) 안의 실제 데이터를 추출.
 * 다양한 필드명(data/result) 또는 raw 응답 모두 지원.
 */
const unwrap = <T>(response: { data: any }, fallback: T): T => {
  const body = response.data;
  return (body?.data ?? body?.result ?? body ?? fallback) as T;
};

/**
 * 매장 목록 통합 조회 (백엔드 GET /stores)
 * 모든 파라미터 옵셔널 — 미지정 시 전체 매장 반환
 */
export interface StoreListParams {
  name?: string;
  category?: string;
  district?: string;
  page?: number;
  size?: number;
}

export const getStores = async (params: StoreListParams = {}): Promise<StoreSummary[]> => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );
  const response = await api.get('/stores', { params: filteredParams });
  return unwrap<StoreSummary[]>(response, []);
};

/**
 * 인기 매장 조회 (평균 평점 내림차순)
 */
export const getPopularStores = async (limit = 10): Promise<StoreSummary[]> => {
  const response = await api.get('/stores/popular', { params: { limit } });
  return unwrap<StoreSummary[]>(response, []);
};

/**
 * 내 주변 매장 조회 (좌표 거리 정렬 + 페이지네이션)
 */
export const getNearbyStores = async (
  latitude: number,
  longitude: number,
  page = 0,
  size = 10,
): Promise<StoreSummary[]> => {
  const response = await api.get('/stores/nearby', {
    params: { latitude, longitude, page, size },
  });
  return unwrap<StoreSummary[]>(response, []);
};

/**
 * 특정 ID를 가진 매장의 상세 정보를 조회하는 API 함수
 * @param storeId - 조회할 매장의 ID
 * @returns 매장 상세 정보
 */
export const getStoreDetail = async (storeId: string): Promise<StoreDetail> => {
  const response = await api.get(`/stores/${storeId}`);
  return unwrap<StoreDetail>(response, {} as StoreDetail);
};

/**
 * 특정 매장의 메뉴 목록을 조회하는 API 함수
 * @param storeId - 조회할 매장의 ID
 */
export const getStoreMenus = async (storeId: string): Promise<Menu[]> => {
  const response = await api.get(`/stores/${storeId}/menu`);
  return unwrap<Menu[]>(response, []);
};

/**
 * 특정 매장의 리뷰 목록을 조회하는 API 함수
 * @param storeId - 조회할 매장의 ID
 */
export const getStoreReviews = async (storeId: string): Promise<Review[]> => {
  const response = await api.get(`/reviews/store/${storeId}`);
  return unwrap<Review[]>(response, []);
};

/**
 * 특정 매장의 특정 날짜 예약 시간대 목록을 조회하는 API 함수
 * @param storeId - 매장 ID
 * @param date - 조회할 날짜 (YYYY-MM-DD)
 */
export const getStoreTimes = async (storeId: string, date: string): Promise<StoreRemain[]> => {
  const response = await api.get(`/remains`, { params: { storeId, date } });
  return unwrap<StoreRemain[]>(response, []);
};
