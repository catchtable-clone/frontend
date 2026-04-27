import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservation, getReservations, cancelReservation, updateReservation } from './reservationApi';
import type { ReservationRequest, ReservationUpdateRequest } from './reservationApi';

export const useCreateReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReservationRequest) => createReservation(data),
    onSuccess: (_, variables) => {
      // 예약 성공 시, 해당 매장의 상세 정보(특히 예약 가능 날짜/잔여 팀 수) 캐시를 무효화하여 최신 상태로 동기화합니다.
      queryClient.invalidateQueries({
        queryKey: ['storeDetail', String(variables.storeId)],
      });
    },
  });
};

export const useUpdateReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reservationId, userId, data }: { reservationId: number; userId: number; data: ReservationUpdateRequest }) =>
      updateReservation(reservationId, userId, data),
    onSuccess: (_, variables) => {
      // 예약 변경 성공 시 예약 목록 및 달력 좌석 수 캐시를 무효화하여 동기화
      queryClient.invalidateQueries({
        queryKey: ['reservations', variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: ['storeDetail'],
      });
    },
  });
};

export const useReservationsQuery = (userId: number) => {
  return useQuery({
    queryKey: ['reservations', userId],
    queryFn: () => getReservations(userId),
    enabled: !!userId,
  });
};

export const useCancelReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reservationId, userId }: { reservationId: number; userId: number }) =>
      cancelReservation(reservationId, userId),
    onSuccess: (_, variables) => {
      // 예약 취소 성공 시 예약 목록 캐시를 무효화하여 최신 상태로 리렌더링
      queryClient.invalidateQueries({
        queryKey: ['reservations', variables.userId],
      });
    },
  });
};