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

export interface BookmarkFolder {
  id: number;
  name: string;
  type: FolderType;
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

export interface Review {
  id: number;
  reservationId: number;
  storeId: number;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
}
