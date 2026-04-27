import api from '@/lib/axios';
import type { Reservation } from '@/types/store';

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

/**
 * 내 예약 내역 목록을 조회하는 API 함수
 * @param userId 로그인한 유저 ID
 */
export const getReservations = async (userId: number): Promise<Reservation[]> => {
  // Swagger 명세에 따라 엔드포인트와 Query Parameter 방식으로 수정
  const response = await api.get('/reservations/me', {
    params: { userId } 
  });
  
  const rawData = response.data.data || response.data.result || response.data || [];

  // 백엔드의 다양한 상태값을 프론트엔드 규격에 맞게 안전하게 매핑합니다.
  const mapStatus = (status: string | undefined): Reservation['status'] => {
    const s = status?.toUpperCase();
    // 백엔드의 ReservationStatus Enum과 1:1 매핑
    if (s === 'PENDING' || s === 'CONFIRMED' || s === 'CANCELED' || s === 'NOSHOW' || s === 'VISITED') {
      return s as Reservation['status'];
    }
    return 'PENDING'; // 알 수 없는 상태일 경우 기본값
  };

  // 백엔드의 필드명을 프론트엔드 Reservation 타입에 맞게 매핑(정규화)합니다.
  return rawData.map((item: any) => ({
    id: item.id || item.reservationId,
    storeId: item.storeId ?? item.store_id ?? item.store?.id ?? item.restaurantId ?? 1, // 백엔드 응답 누락 시 기본값 1 할당 방어코드
    storeName: item.storeName || item.name || item.store?.name || item.store?.storeName || '알 수 없는 매장',
    storeCategory: item.storeCategory || item.category || item.store?.category || '분류 없음',
    date: item.date || item.reservationDate || item.remainDate || item.remain?.date || item.remain?.remainDate || '날짜 미상',
    time: item.time || item.reservationTime || item.remainTime || item.remain?.time || item.remain?.remainTime || '시간 미상',
    guestCount: item.guestCount || item.member || item.headCount || item.count || 0,
    status: mapStatus(item.status),
    reviewId: item.reviewId,
  })) as Reservation[];
};

/**
 * 예약을 취소하는 API 함수
 * @param reservationId 취소할 예약 ID
 * @param userId 로그인한 유저 ID
 */
export const cancelReservation = async (reservationId: number, userId: number): Promise<void> => {
  // 백엔드 API 명세(테스트 코드)에 맞춰 쿼리 파라미터로 전달합니다.
  await api.delete(`/reservations/${reservationId}`, {
    params: { userId }
  });
};

/**
 * 예약을 변경하는 API 함수
 * @param reservationId 변경할 예약 ID
 * @param userId 로그인한 유저 ID
 * @param data 변경할 예약 데이터 (새로운 remainId, 인원수)
 */
export const updateReservation = async (
  reservationId: number,
  userId: number,
  data: ReservationUpdateRequest
): Promise<Reservation> => {
  const payload = {
    newRemainId: data.remainId,
    newMember: data.guestCount, // 백엔드의 예약 변경 DTO 파라미터 매핑
  };
  // 백엔드 API 명세에 맞춰 PATCH 메서드를 사용합니다.
  const response = await api.patch(`/reservations/${reservationId}`, payload, {
    params: { userId }
  });
  return (response.data.data || response.data.result || response.data) as Reservation;
};