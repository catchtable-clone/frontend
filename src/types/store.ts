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

export type BackendCategory =
  | 'KOREAN'
  | 'JAPANESE'
  | 'CHINESE'
  | 'WESTERN'
  | 'DESSERT'
  | 'CHICKEN'
  | 'FOREIGN'
  | 'MEAT'
  | 'FISH'
  | 'FASTFOOD'
  | 'BUFFET'
  | 'OTHERS';

export type BackendDistrict =
  | 'JONGNO' | 'JUNG' | 'YONGSAN' | 'SEONGDONG' | 'GWANGJIN'
  | 'DONGDAEMUN' | 'JUNGNANG' | 'SEONGBUK' | 'GANGBUK' | 'DOBONG'
  | 'NOWON' | 'EUNPYEONG' | 'SEODAEMUN' | 'MAPO' | 'YANGCHEON'
  | 'GANGSEO' | 'GURO' | 'GEUMCHEON' | 'YEONGDEUNGPO' | 'DONGJAK'
  | 'GWANAK' | 'SEOCHO' | 'GANGNAM' | 'SONGPA' | 'GANGDONG';

export interface StoreListResponseDto {
  storeId: number;
  storeName: string;
  storeImage: string | null;
  category: BackendCategory;
  address: string;
  district: BackendDistrict;
  latitude: number;
  longitude: number;
}

export const CATEGORY_LABEL: Record<BackendCategory, string> = {
  KOREAN: '한식',
  JAPANESE: '일식',
  CHINESE: '중식',
  WESTERN: '양식',
  DESSERT: '카페',
  CHICKEN: '치킨',
  FOREIGN: '외국음식',
  MEAT: '고기',
  FISH: '횟집',
  FASTFOOD: '패스트푸드',
  BUFFET: '뷔페',
  OTHERS: '기타',
};

export const CATEGORY_TO_ENUM: Record<string, BackendCategory> = Object.entries(
  CATEGORY_LABEL,
).reduce(
  (acc, [k, v]) => ({ ...acc, [v]: k as BackendCategory }),
  {} as Record<string, BackendCategory>,
);

export const DISTRICT_LABEL: Record<BackendDistrict, string> = {
  JONGNO: '종로구',
  JUNG: '중구',
  YONGSAN: '용산구',
  SEONGDONG: '성동구',
  GWANGJIN: '광진구',
  DONGDAEMUN: '동대문구',
  JUNGNANG: '중랑구',
  SEONGBUK: '성북구',
  GANGBUK: '강북구',
  DOBONG: '도봉구',
  NOWON: '노원구',
  EUNPYEONG: '은평구',
  SEODAEMUN: '서대문구',
  MAPO: '마포구',
  YANGCHEON: '양천구',
  GANGSEO: '강서구',
  GURO: '구로구',
  GEUMCHEON: '금천구',
  YEONGDEUNGPO: '영등포구',
  DONGJAK: '동작구',
  GWANAK: '관악구',
  SEOCHO: '서초구',
  GANGNAM: '강남구',
  SONGPA: '송파구',
  GANGDONG: '강동구',
};

export const DISTRICT_TO_ENUM: Record<string, BackendDistrict> = Object.entries(
  DISTRICT_LABEL,
).reduce(
  (acc, [k, v]) => ({ ...acc, [v]: k as BackendDistrict }),
  {} as Record<string, BackendDistrict>,
);

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

// === 쿠폰 백엔드 DTO ===
export type BackendCouponStatus = 'UNUSED' | 'USED' | 'EXPIRED';

export interface CouponReadResponseDto {
  couponId: number;
  couponName: string;
  discountRate: number;
  status: BackendCouponStatus;
  usedAt: string | null;
  expiredAt: string;
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
