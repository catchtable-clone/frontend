import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getStoreDetail,
  getStoreMenus,
  getStoreReviews,
  getStoreTimes,
  getStores,
  getPopularStores,
  getNearbyStores,
  StoreListParams,
} from './storeApi';

/**
 * 매장 목록 통합 조회 TanStack Query 훅
 * @param params name·category·district 옵셔널
 * @param enabled false면 호출 안 함 (입력 후에만 실행 등)
 */
export const useStoresQuery = (params: StoreListParams = {}, enabled = true) => {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => getStores(params),
    enabled,
  });
};

/**
 * 매장 목록 통합 조회 무한 스크롤 훅 (카테고리/지역 필터 + 페이지네이션)
 */
export const useStoresInfiniteQuery = (
  params: Omit<StoreListParams, 'page' | 'size'> = {},
  size = 10,
) => {
  return useInfiniteQuery({
    queryKey: ['storesInfinite', params, size],
    queryFn: ({ pageParam = 0 }) => getStores({ ...params, page: pageParam, size }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === size ? allPages.length : undefined,
  });
};

/**
 * 인기 매장 조회 (평점 내림차순)
 */
export const usePopularStoresQuery = (limit = 10) => {
  return useQuery({
    queryKey: ['popularStores', limit],
    queryFn: () => getPopularStores(limit),
  });
};

/**
 * 내 주변 매장 무한 스크롤 조회
 */
export const useNearbyStoresInfiniteQuery = (
  latitude: number,
  longitude: number,
  size = 10,
  enabled = true,
) => {
  return useInfiniteQuery({
    queryKey: ['nearbyStores', latitude, longitude, size],
    queryFn: ({ pageParam = 0 }) => getNearbyStores(latitude, longitude, pageParam, size),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === size ? allPages.length : undefined,
    enabled,
  });
};

/**
 * 매장 상세 정보를 조회하는 TanStack Query 전용 훅
 * @param storeId - 조회할 매장의 ID
 */
export const useStoreDetailQuery = (storeId: string) => {
  return useQuery({
    queryKey: ['storeDetail', storeId],
    queryFn: () => getStoreDetail(storeId),
    enabled: !!storeId && storeId !== 'undefined',
    staleTime: 0, // 뒤로가기 시 발생하는 Next.js 라우터 캐시 데드락 방지
  });
};

/**
 * 매장의 특정 날짜 시간대 목록을 조회하는 TanStack Query 전용 훅
 */
export const useStoreTimesQuery = (storeId: string, date: string) => {
  return useQuery({
    queryKey: ['storeTimes', storeId, date],
    queryFn: () => getStoreTimes(storeId, date),
    enabled: !!storeId && storeId !== 'undefined' && !!date,
  });
};

/**
 * 매장의 리뷰 목록을 조회하는 TanStack Query 전용 훅
 */
export const useStoreReviewsQuery = (storeId: string) => {
  return useQuery({
    queryKey: ['storeReviews', storeId],
    queryFn: () => getStoreReviews(storeId),
    enabled: !!storeId && storeId !== 'undefined',
  });
};

/**
 * 매장의 메뉴 목록을 조회하는 TanStack Query 전용 훅
 */
export const useStoreMenusQuery = (storeId: string) => {
  return useQuery({
    queryKey: ['storeMenus', storeId],
    queryFn: () => getStoreMenus(storeId),
    enabled: !!storeId && storeId !== 'undefined',
  });
};
