import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { createReview, getMyReviews, updateReview, deleteReview } from './reviewApi';
import type { CreateReviewRequest, UpdateReviewRequest } from './reviewApi';

const myReviewsKey = (userId: number | null) => ['myReviews', userId];
const reservationsKey = (userId: number | null) => ['reservations', userId];

export const useCreateReviewMutation = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reservationsKey(userId) });
      queryClient.invalidateQueries({
        queryKey: ['storeReviews', String(variables.storeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ['storeDetail', String(variables.storeId)],
      });
      queryClient.invalidateQueries({ queryKey: myReviewsKey(userId) });
    },
  });
};

export const useMyReviewsQuery = () => {
  const userId = useAuthStore((s) => s.userId);
  return useQuery({
    queryKey: myReviewsKey(userId),
    queryFn: getMyReviews,
    enabled: !!userId,
  });
};

export const useUpdateReviewMutation = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: number; data: UpdateReviewRequest }) =>
      updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myReviewsKey(userId) });
      queryClient.invalidateQueries({ queryKey: ['storeReviews'] });
      queryClient.invalidateQueries({ queryKey: ['storeDetail'] });
    },
  });
};

export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myReviewsKey(userId) });
      queryClient.invalidateQueries({ queryKey: reservationsKey(userId) });
      queryClient.invalidateQueries({ queryKey: ['storeReviews'] });
      queryClient.invalidateQueries({ queryKey: ['storeDetail'] });
    },
  });
};
