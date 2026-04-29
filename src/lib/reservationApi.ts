import api from '@/lib/axios';
import { unwrap } from '@/lib/apiUtils';
import type { Reservation, ReservationStatus } from '@/types/store';
import { toCategoryLabel } from '@/lib/storeEnum';

export interface ReservationRequest {
  storeId: number;
  date: string;
  time: string;
  guestCount: number;
  remainId: number;
}

export interface ReservationUpdateRequest {
  remainId: number;
  guestCount: number;
}

/**
 * 백엔드 예약 응답 DTO. 명세에 정의된 필드만 매핑한다.
 * (이전 버전의 store_id / store?.id / restaurantId 같은 폴백 매핑은 제거.
 *  실제 누락이라면 정상적으로 undefined가 노출되어 즉시 발견되도록 한다.)
 */
interface ReservationApiResponse {
  reservationId: number;
  storeId: number;
  storeName: string;
  storeCategory: string;
  date: string;
  time: string;
  member: number;
  status: ReservationStatus;
}

/**
 * 새로운 예약을 생성하는 API 함수
 */
export const createReservation = async (data: ReservationRequest): Promise<Reservation> => {
  const payload = {
    storeId: data.storeId,
    date: data.date,
    time: data.time,
    member: data.guestCount, // 백엔드 member 파라미터 매핑
    userId: 1,               // FIXME: 실제 로그인된 유저 ID (별도 작업 — Critical 항목 1번)
    remainId: data.remainId,
  };
  const response = await api.post('/reservations', payload);
  return unwrap<Reservation>(response, {} as Reservation);
};

/**
 * 내 예약 내역 목록 조회
 */
export const getReservations = async (userId: number): Promise<Reservation[]> => {
  const response = await api.get('/reservations/me', { params: { userId } });
  const rawData = unwrap<ReservationApiResponse[]>(response, []);

  // 백엔드 DTO 필드명을 프론트 Reservation 타입으로 1:1 매핑
  return rawData.map((item) => ({
    id: item.reservationId,
    storeId: item.storeId,
    storeName: item.storeName,
    storeCategory: toCategoryLabel(item.storeCategory),
    date: item.date,
    time: item.time,
    guestCount: item.member,
    status: item.status,
  }));
};

/**
 * 예약 취소
 */
export const cancelReservation = async (reservationId: number, userId: number): Promise<void> => {
  await api.delete(`/reservations/${reservationId}`, { params: { userId } });
};

/**
 * 예약 변경
 */
export const updateReservation = async (
  reservationId: number,
  userId: number,
  data: ReservationUpdateRequest,
): Promise<Reservation> => {
  const payload = {
    newRemainId: data.remainId,
    newMember: data.guestCount,
  };
  const response = await api.patch(`/reservations/${reservationId}`, payload, {
    params: { userId },
  });
  return unwrap<Reservation>(response, {} as Reservation);
};
