/**
 * 백엔드에서 넘어오는 Store(매장) 데이터의 상세 정보를 위한 타입
 */
export interface StoreDetail {
  storeId: number;
  storeName: string;
  storeImage?: string;
  category: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  openTime: string;
  closeTime: string;
  averageStar: number;
  reviewCount?: number;
  bookmarkCount?: number;
  remainDates?: RemainDate[];
}

/**
 * 매장 상세의 날짜별 예약 가능 여부 (백엔드 RemainDateResponse)
 */
export interface RemainDate {
  date: string;
  available: boolean;
}

/**
 * 시간대 조회 응답 (백엔드 StoreRemainResponseDto)
 */
export interface StoreRemain {
  remainId: number;
  remainDate: string;
  remainTime: string;
  remainTeam: number;
}

/**
 * 아래는 기존 UI 컴포넌트(북마크, 예약, 리뷰 등)에서 사용되는 타입 및 상수들입니다.
 */

export const FOLDER_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', 
  '#3B82F6', '#A855F7', '#EC4899', '#6B7280'
];

export interface BookmarkFolder {
  id: number;
  name: string;
  color: string;
  type?: string;
  storeIds: number[];
  count?: number;
}

export interface Menu {
  menuId: number;
  storeId?: number;
  menuName: string;
  description?: string;
  price: number;
  menuImage?: string;
}

/**
 * 매장 목록 응답용 타입 (백엔드 StoreListResponse)
 */
export interface StoreSummary {
  storeId: number;
  storeName: string;
  storeImage?: string;
  category: string;
  address: string;
  district?: string;
  latitude: number;
  longitude: number;
  averageStar: number;
  reviewCount: number;
}

export type ReservationStatus = 'CONFIRMED' | 'VISITED' | 'CANCELLED' | 'NOSHOW';

export interface Reservation {
  id: number;
  storeId: number;
  storeName: string;
  storeCategory: string;
  date: string;
  time: string;
  guestCount: number;
  status: ReservationStatus;
  reviewId?: number;
}

export interface Review {
  reviewId: number;
  reservationId?: number;
  storeId?: number;
  storeName?: string;
  userId?: number;
  userNickname?: string;
  star?: number;
  content: string;
  reviewImage?: string;
  createdAt: string;
  // 임시 호환 필드 (mypage/reviews 등 다른 페이지에서 사용 중, Phase 2/3 정리 예정)
  id?: number;
  rating?: number;
  imageUrls?: string[];
  userName?: string;
  user?: { id: number; name?: string; nickname?: string };
  nickname?: string;
}

export interface VacancySubscription {
  id: number;
  storeId: number;
  storeName: string;
  storeCategory: string;
  date: string;
  time: string;
}