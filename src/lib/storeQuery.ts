import { useQuery } from '@tanstack/react-query';
import { getStoreDetail, getStoreMenus, getStoreReviews, getStoreTimes } from './storeApi';

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