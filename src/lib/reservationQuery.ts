import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { createReservation, getReservations, cancelReservation, updateReservation, markReservationVisited } from './reservationApi';
import type { ReservationRequest, ReservationUpdateRequest } from './reservationApi';

const reservationsKey = (userId: number | null) => ['reservations', userId];

export const useCreateReservationMutation = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: (data: ReservationRequest) => createReservation(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['storeDetail', String(variables.storeId)],
      });
      queryClient.invalidateQueries({ queryKey: reservationsKey(userId) });
    },
  });
};

export const useUpdateReservationMutation = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: ({ reservationId, data }: { reservationId: number; data: ReservationUpdateRequest }) =>
      updateReservation(reservationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationsKey(userId) });
      queryClient.invalidateQueries({ queryKey: ['storeDetail'] });
    },
  });
};

export const useReservationsQuery = () => {
  const userId = useAuthStore((s) => s.userId);

  return useQuery({
    queryKey: reservationsKey(userId),
    queryFn: getReservations,
    enabled: !!userId,
  });
};

export const useCancelReservationMutation = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: (reservationId: number) => cancelReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationsKey(userId) });
    },
  });
};

export const useMarkVisitedMutation = () => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  return useMutation({
    mutationFn: (reservationId: number) => markReservationVisited(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationsKey(userId) });
    },
  });
};
