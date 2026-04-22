/**
 * 백엔드에서 넘어오는 Store(매장) 데이터의 상세 정보를 위한 타입
 */
export interface StoreDetail {
  id: number;
  storeName: string;
  category: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  openTime: string;
  closeTime: string;
  reviewCount?: number;
  bookmarkCount?: number;
  remainDates?: StoreRemain[];
  storeRemains?: StoreRemain[] | string[] | unknown[][];
  remains?: StoreRemain[] | string[] | unknown[][];
}

export interface StoreRemain {
  date?: string;
  remainDate?: string;
  remain_date?: string;
  available?: boolean;
  isAvailable?: boolean;
  hasRemain?: boolean;
  remainTeam?: number;
  remainCount?: number;
  teamCount?: number;
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
  id: number;
  storeId: number;
  name: string;
  description: string;
  price: number;
  menuImage?: string;
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
  id?: number;
  reviewId?: number;
  reservationId?: number;
  storeId?: number;
  rating?: number;
  star?: number;
  content: string;
  imageUrls?: string[];
  createdAt: string;
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