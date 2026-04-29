import api from '@/lib/axios';
import {
  BackendCouponStatus,
  Coupon,
  CouponReadResponseDto,
  CouponStatus,
} from '@/types/store';

interface ApiEnvelope<T> {
  status: number;
  message: string;
  data: T;
}

const STATUS_MAP: Record<BackendCouponStatus, CouponStatus> = {
  UNUSED: 'AVAILABLE',
  USED: 'USED',
  EXPIRED: 'EXPIRED',
};

function toCoupon(dto: CouponReadResponseDto): Coupon {
  return {
    id: dto.couponId,
    name: dto.couponName,
    discountRate: dto.discountRate,
    status: STATUS_MAP[dto.status],
    expiresAt: dto.expiredAt,
  };
}

export async function getMyCoupons(): Promise<Coupon[]> {
  const res = await api.get<ApiEnvelope<CouponReadResponseDto[]>>(
    '/coupons/me',
  );
  return res.data.data.map(toCoupon);
}
