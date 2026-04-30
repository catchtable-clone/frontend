import { Store, Review, Coupon } from '@/types/store';

export const mockStores: Store[] = [
  {
    id: 1,
    name: '스시 소라',
    category: '일식',
    address: '서울 강남구 역삼동',
    rating: 4.8,
    reviewCount: 324,
    imageUrl: '',
    openTime: '11:00',
    closeTime: '22:00',
    lat: 37.4979,
    lng: 127.0276,
  },
  {
    id: 2,
    name: '모수 서울',
    category: '한식',
    address: '서울 용산구 한남동',
    rating: 4.9,
    reviewCount: 512,
    imageUrl: '',
    openTime: '12:00',
    closeTime: '22:00',
    lat: 37.5345,
    lng: 126.9978,
  },
  {
    id: 4,
    name: '라멘 이찌',
    category: '일식',
    address: '서울 강남구 신사동',
    rating: 4.6,
    reviewCount: 287,
    imageUrl: '',
    openTime: '11:00',
    closeTime: '21:00',
    lat: 37.5171,
    lng: 127.0213,
  },
  {
    id: 6,
    name: '카페 온도',
    category: '카페',
    address: '서울 성동구 성수동',
    rating: 4.7,
    reviewCount: 423,
    imageUrl: '',
    openTime: '09:00',
    closeTime: '22:00',
    lat: 37.5447,
    lng: 127.0557,
  },
];

export const mockReviews: Review[] = [
  {
    reviewId: 1,
    reservationId: 3,
    storeId: 2,
    star: 5,
    content: '한우 코스가 정말 훌륭했습니다. 분위기도 좋고 서비스도 최고!',
    createdAt: '2026-04-11T10:00:00',
  },
];

export const mockCoupons: Coupon[] = [
  {
    id: 1,
    name: '신규 가입 할인 쿠폰',
    discountRate: 10,
    status: 'AVAILABLE',
    expiresAt: '2026-05-31',
  },
  {
    id: 2,
    name: '봄맞이 특별 할인 쿠폰',
    discountRate: 15,
    status: 'AVAILABLE',
    expiresAt: '2026-04-30',
  },
  {
    id: 3,
    name: '첫 예약 감사 쿠폰',
    discountRate: 5,
    status: 'USED',
    expiresAt: '2026-04-15',
  },
];
