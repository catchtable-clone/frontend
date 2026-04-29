import api from '@/lib/axios';
import { unwrap } from '@/lib/apiUtils';
import { StoreDetail, StoreSummary, Menu, Review, StoreRemain } from '@/types/store';

/**
 * 매장 등록 요청 (백엔드 StoreCreateRequest)
 */
export interface StoreCreateRequest {
  storeName: string;
  storeImage?: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  team: number;
  openTime: string;
  closeTime: string;
}

/**
 * 매장 등록 (어드민 전용, 백엔드 POST /stores)
 */
export const createStore = async (data: StoreCreateRequest): Promise<{ storeId: number }> => {
  const response = await api.post('/stores', data);
  return unwrap<{ storeId: number }>(response, { storeId: 0 });
};

/**
 * 매장 정보 수정 (어드민 전용, 백엔드 PUT /stores/{storeId})
 * 등록 후 이미지 업로드 → 다시 storeImage URL을 반영하는 3단계 흐름에서 사용.
 */
export const updateStore = async (
  storeId: number,
  data: StoreCreateRequest,
): Promise<{ storeId: number }> => {
  const response = await api.put(`/stores/${storeId}`, data);
  return unwrap<{ storeId: number }>(response, { storeId });
};

/**
 * 메뉴 일괄 등록 요청
 */
export interface MenuItemRequest {
  menuName: string;
  price: number;
  description?: string;
  menuImage?: string;
}

/**
 * 메뉴 일괄 등록 (백엔드 POST /stores/{storeId}/menu)
 */
export const createMenus = async (
  storeId: number,
  menus: MenuItemRequest[],
): Promise<{ menuId: number[] }> => {
  const response = await api.post(`/stores/${storeId}/menu`, { menus });
  return unwrap<{ menuId: number[] }>(response, { menuId: [] });
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
