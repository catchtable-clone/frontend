import api from '@/lib/axios';
import { StoreDetail, StoreSummary, Menu, Review, StoreRemain } from '@/types/store';

/**
 * 매장명으로 매장 검색 (백엔드 GET /stores?name=)
 */
export const searchStores = async (name: string): Promise<StoreSummary[]> => {
  const response = await api.get('/stores', { params: { name } });
  return (response.data.data || response.data.result || response.data || []) as StoreSummary[];
};

/**
 * 지역(구) 기준 매장 조회 (백엔드 GET /stores/district?district=)
 */
export const getStoresByDistrict = async (district: string): Promise<StoreSummary[]> => {
  const response = await api.get('/stores/district', { params: { district } });
  return (response.data.data || response.data.result || response.data || []) as StoreSummary[];
};

/**
 * 특정 ID를 가진 매장의 상세 정보를 조회하는 API 함수
 * @param storeId - 조회할 매장의 ID
 * @returns 매장 상세 정보
 */
export const getStoreDetail = async (storeId: string): Promise<StoreDetail> => {
  const response = await api.get(`/stores/${storeId}`);
  return (response.data.data || response.data.result || response.data) as StoreDetail;
};

/**
 * 특정 매장의 메뉴 목록을 조회하는 API 함수
 * @param storeId - 조회할 매장의 ID
 */
export const getStoreMenus = async (storeId: string): Promise<Menu[]> => {
  // 백엔드 API 설계에 맞춰 정확한 주소로 변경합니다.
  const response = await api.get(`/stores/${storeId}/menu`);
  return (response.data.data || response.data.result || response.data || []) as Menu[];
};

/**
 * 특정 매장의 리뷰 목록을 조회하는 API 함수
 * @param storeId - 조회할 매장의 ID
 */
export const getStoreReviews = async (storeId: string): Promise<Review[]> => {
  const response = await api.get(`/reviews/store/${storeId}`);
  return (response.data.data || response.data.result || response.data || []) as Review[];
};

/**
 * 특정 매장의 특정 날짜 예약 시간대 목록을 조회하는 API 함수
 * @param storeId - 매장 ID
 * @param date - 조회할 날짜 (YYYY-MM-DD)
 */
export const getStoreTimes = async (storeId: string, date: string): Promise<StoreRemain[]> => {
  const response = await api.get(`/remains`, { params: { storeId, date } });
  return (response.data.data || response.data.result || response.data || []) as StoreRemain[];
};