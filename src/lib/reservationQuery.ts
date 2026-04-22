import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReservation } from './reservationApi';
import type { ReservationRequest } from './reservationApi';

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