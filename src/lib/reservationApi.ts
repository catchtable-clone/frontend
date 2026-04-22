import api from '@/lib/axios';
import type { Reservation } from '@/types/store';

export interface ReservationRequest {
  storeId: number;
  date: string;
  time: string;
  guestCount: number;
  remainId: number;
}

/**
 * 새로운 예약을 생성하는 API 함수
 * @param data 예약 요청 데이터 (매장ID, 날짜, 시간, 인원수)
 */
export const createReservation = async (data: ReservationRequest): Promise<Reservation> => {
  // 백엔드 API 명세(테스트 코드)에 맞춰 Request Body를 구성합니다.
  const payload = {
    storeId: data.storeId,
    date: data.date,
    time: data.time,
    member: data.guestCount, // 백엔드의 member 파라미터 매핑
    userId: 1,               // FIXME: 실제 로그인된 유저 ID (추후 AuthStore에서 연동)
    remainId: data.remainId  // 선택된 시간대의 실제 remainId 전달
  };

  const response = await api.post('/reservations', payload);
  return (response.data.data || response.data.result || response.data) as Reservation;
};