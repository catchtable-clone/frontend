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

/**
 * 무지개 팔레트 — 빨주노초파남보 + 회색.
 * value는 백엔드 bookmark_folders.color 컬럼(VARCHAR HEX)에 그대로 저장된다.
 */
export const FOLDER_COLORS: Array<{ value: string; label: string }> = [
  { value: '#EF4444', label: '빨강' },
  { value: '#F97316', label: '주황' },
  { value: '#EAB308', label: '노랑' },
  { value: '#22C55E', label: '초록' },
  { value: '#3B82F6', label: '파랑' },
  { value: '#1E3A8A', label: '남색' },
  { value: '#A855F7', label: '보라' },
  { value: '#6B7280', label: '회색' },
];

/**
 * 클라이언트 측 폴더 표현. 백엔드 BookmarkFolderListResponse를 어댑팅한다.
 *  - id ← folderId
 *  - name ← folderName
 *  - type: 'DEFAULT' | 'CUSTOM' (백엔드 동일)
 *  - storeIds: 폴더 안 매장 ID 배열 (필요 시 별도 조회)
 */
export interface BookmarkFolder {
  id: number;
  name: string;
  color: string;
  type?: 'DEFAULT' | 'CUSTOM' | 'SLACK';
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

/**
 * 백엔드 ReservationStatus enum과 1:1 매칭.
 * 주의: 백엔드는 'CANCELED' (single L). 프론트도 동일하게 사용한다.
 */
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'VISITED' | 'CANCELED' | 'NOSHOW';

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

/**
 * 쿠폰 상태 — 사용 가능 / 사용 완료 / 기간 만료
 */
export type CouponStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

/**
 * 사용자 보유 쿠폰
 */
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