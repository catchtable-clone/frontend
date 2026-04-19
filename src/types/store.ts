export interface Store {
  id: number;
  name: string;
  category: string;
  address: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  openTime: string;
  closeTime: string;
  lat: number;
  lng: number;
  isClosed?: boolean;
}

export interface Menu {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'NOSHOW' | 'VISITED';

export interface Reservation {
  id: number;
  storeId: number;
  storeName: string;
  storeCategory: string;
  date: string;
  time: string;
  guestCount: number;
  status: ReservationStatus;
  createdAt: string;
  reviewId?: number;
}

export type FolderType = 'DEFAULT' | 'SLACK' | 'CUSTOM';

export const FOLDER_COLORS = [
  { name: '주황', value: '#f97316' },
  { name: '빨강', value: '#ef4444' },
  { name: '파랑', value: '#3b82f6' },
  { name: '초록', value: '#22c55e' },
  { name: '보라', value: '#a855f7' },
  { name: '핑크', value: '#ec4899' },
  { name: '하늘', value: '#06b6d4' },
  { name: '노랑', value: '#eab308' },
] as const;

export interface BookmarkFolder {
  id: number;
  name: string;
  type: FolderType;
  color: string;
  storeIds: number[];
}

export type NotificationType = 'RESERVATION_CONFIRMED' | 'RESERVATION_REMIND' | 'VACANCY';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  storeId: number;
  storeName: string;
  isRead: boolean;
  createdAt: string;
}

export type CouponStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

export interface Coupon {
  id: number;
  name: string;
  discountRate: number;
  status: CouponStatus;
  expiresAt: string;
}

export interface ChatMessage {
  id: number;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface VacancySubscription {
  id: number;
  storeId: number;
  storeName: string;
  storeCategory: string;
  date: string;
  time: string;
  createdAt: string;
}

export interface StoreReview {
  id: number;
  storeId: number;
  userName: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface Review {
  id: number;
  reservationId: number;
  storeId: number;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
}
