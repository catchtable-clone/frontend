import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview, getMyReviews } from './reviewApi';
import type { CreateReviewRequest } from './reviewApi';

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: CreateReviewRequest }) =>
      createReview(userId, data),
    onSuccess: (_, variables) => {
      // 리뷰 작성 완료 시 내 예약 내역의 리뷰 상태 업데이트
      queryClient.invalidateQueries({
        queryKey: ['reservations', variables.userId],
      });
      // 해당 매장의 리뷰 목록 및 별점 갱신
      queryClient.invalidateQueries({
        queryKey: ['storeReviews', String(variables.data.storeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ['storeDetail', String(variables.data.storeId)],
      });
      // 내 리뷰 목록 캐시도 함께 갱신
      queryClient.invalidateQueries({
        queryKey: ['myReviews', variables.userId],
      });
    },
  });
};

export const useMyReviewsQuery = (userId: number) => {
  return useQuery({
    queryKey: ['myReviews', userId],
    queryFn: () => getMyReviews(userId),
    enabled: !!userId,
  });
};