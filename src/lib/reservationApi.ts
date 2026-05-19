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
  couponId?: number;
}

export interface ReservationUpdateRequest {
  remainId: number;
  guestCount: number;
  couponId?: number;
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
  orderId?: string;
}

export interface ReservationCreateResponse {
  id: number;
  orderId: string;
  amount: number;
  status: string;
}

export const createReservation = async (data: ReservationRequest): Promise<ReservationCreateResponse> => {
  const payload = {
    remainId: data.remainId,
    member: data.guestCount,
    couponId: data.couponId,
  };
  const response = await api.post('/reservations', payload);
  return unwrap<ReservationCreateResponse>(response, {} as ReservationCreateResponse);
};

/**
 * 내 예약 내역 목록 조회.
 * 백엔드 status는 lowercase("pending"...)로 내려오므로 프론트 enum(uppercase)로 정규화한다.
 */
export const getReservations = async (): Promise<Reservation[]> => {
  const response = await api.get('/reservations/me');
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
    orderId: item.orderId,
  }));
};

export const cancelReservation = async (reservationId: number): Promise<void> => {
  await api.delete(`/reservations/${reservationId}`);
};

export const updateReservation = async (
  reservationId: number,
  data: ReservationUpdateRequest,
): Promise<Reservation> => {
  const payload = {
    newRemainId: data.remainId,
    newMember: data.guestCount,
    couponId: data.couponId,
  };
  const response = await api.patch(`/reservations/${reservationId}`, payload);
  return unwrap<Reservation>(response, {} as Reservation);
};
