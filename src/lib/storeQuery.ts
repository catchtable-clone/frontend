import { useQuery } from '@tanstack/react-query';
import { getStoreDetail, getStoreMenus, getStoreReviews } from './storeApi'; // 같은 lib 폴더 내에서의 확실한 상대 경로

/**
 * 매장 상세 정보를 조회하는 TanStack Query 전용 훅
 * @param storeId - 조회할 매장의 ID
 */
export const useStoreDetailQuery = (storeId: string) => {
  return useQuery({
    queryKey: ['storeDetail', storeId],
    queryFn: () => getStoreDetail(storeId),
    enabled: !!storeId,
    staleTime: 0, // 뒤로가기 시 발생하는 Next.js 라우터 캐시 데드락 방지
  });
};

/**
 * 매장의 리뷰 목록을 조회하는 TanStack Query 전용 훅
 */
export const useStoreReviewsQuery = (storeId: string) => {
  return useQuery({
    queryKey: ['storeReviews', storeId],
    queryFn: () => getStoreReviews(storeId),
    enabled: !!storeId,
  });
};

/**
 * 매장의 메뉴 목록을 조회하는 TanStack Query 전용 훅
 */
export const useStoreMenusQuery = (storeId: string) => {
  return useQuery({
    queryKey: ['storeMenus', storeId],
    queryFn: () => getStoreMenus(storeId),
    enabled: !!storeId,
  });
};