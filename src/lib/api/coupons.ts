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

export interface ActiveCouponTemplate {
  templateId: number;
  couponName: string;
  discountRate: number;
  amount: number;
  remain: number;
  startedAt: string;
  expiredAt: string;
}

export async function getActiveCouponTemplates(): Promise<ActiveCouponTemplate[]> {
  const res = await api.get<ApiEnvelope<ActiveCouponTemplate[]>>(
    '/coupons/templates/active',
  );
  return res.data.data ?? [];
}

export async function issueCoupon(templateId: number): Promise<void> {
  await api.post(`/coupons/${templateId}/issue`);
}

export interface CreateCouponTemplateRequest {
  couponName: string;
  discountRate: number;
  amount: number;
  startedAt: string; // LocalDateTime ISO string
  expiredAt: string;
}

export interface CreateCouponTemplateResponse {
  templateId: number;
  couponName: string;
}

export async function createCouponTemplate(
  data: CreateCouponTemplateRequest,
): Promise<CreateCouponTemplateResponse> {
  const res = await api.post<ApiEnvelope<CreateCouponTemplateResponse>>(
    '/coupons/templates',
    data,
  );
  return res.data.data;
}
