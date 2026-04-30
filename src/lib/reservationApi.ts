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
 * 백엔드 ReservationListResponseDto와 1:1 매칭되는 응답 타입.
 * 필드명은 모두 백엔드 record 그대로 사용한다.
 *  - id (예약 PK)
 *  - remainDate / remainTime (StoreRemain의 날짜·시간)
 *  - status는 서비스에서 toLowerCase()로 내려줌 (예: "pending", "confirmed")
 */
interface ReservationApiResponse {
  id: number;
  remainId: number;
  status: string;
  storeId: number;
  storeName: string;
  storeImage: string;
  storeCategory: string;
  remainDate: string;
  remainTime: string;
  member: number;
  createdAt: string;
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
 * 내 예약 내역 목록 조회.
 * 백엔드 status는 lowercase("pending"...)로 내려오므로 프론트 enum(uppercase)로 정규화한다.
 */
export const getReservations = async (userId: number): Promise<Reservation[]> => {
  const response = await api.get('/reservations/me', { params: { userId } });
  const rawData = unwrap<ReservationApiResponse[]>(response, []);

  return rawData.map((item) => ({
    id: item.id,
    storeId: item.storeId,
    storeName: item.storeName,
    storeCategory: toCategoryLabel(item.storeCategory),
    date: item.remainDate,
    time: item.remainTime,
    guestCount: item.member,
    status: (item.status?.toUpperCase() ?? 'PENDING') as ReservationStatus,
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
