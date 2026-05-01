'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ticket } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import Header from '@/components/common/Header';
import { useAuthStore } from '@/stores/authStore';
import { useMeQuery } from '@/lib/userQuery';
import { createCouponTemplate } from '@/lib/api/coupons';

interface FormState {
  couponName: string;
  discountRate: string;
  amount: string;
  startedAt: string; // datetime-local
  expiredAt: string;
}

const INITIAL: FormState = {
  couponName: '',
  discountRate: '10',
  amount: '100',
  startedAt: '',
  expiredAt: '',
};

export default function AdminCouponTemplateCreatePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  useMeQuery();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  const isReady = accessToken && user;
  const isAdmin = user?.role === 'ADMIN';

  if (!accessToken) {
    return (
      <>
        <Header title="쿠폰 템플릿 생성" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">로그인이 필요합니다.</p>
        </main>
      </>
    );
  }

  if (isReady && !isAdmin) {
    return (
      <>
        <Header title="쿠폰 템플릿 생성" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">관리자만 접근할 수 있습니다.</p>
        </main>
      </>
    );
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // datetime-local 입력값(YYYY-MM-DDTHH:mm)을 LocalDateTime ISO string으로 변환
  // 백엔드 LocalDateTime 파서는 초 자리까지 받기 때문에 ":00"을 붙여 안전하게 보냄
  const toLocalDateTimeString = (value: string): string =>
    value.length === 16 ? `${value}:00` : value;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.couponName.trim()) {
      toast.error('쿠폰 이름을 입력해주세요.');
      return;
    }
    const discountRate = Number(form.discountRate);
    const amount = Number(form.amount);
    if (!Number.isFinite(discountRate) || discountRate <= 0 || discountRate > 100) {
      toast.error('할인율은 1~100 사이로 입력해주세요.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('수량은 1 이상이어야 합니다.');
      return;
    }
    if (!form.startedAt || !form.expiredAt) {
      toast.error('시작/만료 일시를 입력해주세요.');
      return;
    }
    if (new Date(form.startedAt) >= new Date(form.expiredAt)) {
      toast.error('만료 일시는 시작 일시보다 뒤여야 합니다.');
      return;
    }

    try {
      setSubmitting(true);
      const result = await createCouponTemplate({
        couponName: form.couponName.trim(),
        discountRate,
        amount,
        startedAt: toLocalDateTimeString(form.startedAt),
        expiredAt: toLocalDateTimeString(form.expiredAt),
      });
      toast.success(`쿠폰 템플릿이 생성되었습니다. (ID: ${result.templateId})`);
      // 홈 배너에서 즉시 반영되도록 활성 템플릿 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['activeCouponTemplates'] });
      router.push('/mypage');
    } catch {
      // 에러 토스트는 axios 인터셉터가 처리
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title="쿠폰 템플릿 생성" showBack />
      <main className="flex-1 px-4 py-4">
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <Ticket size={18} />
          <span>홈 화면 배너에 노출될 선착순 쿠폰을 등록합니다.</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="쿠폰 이름">
            <input
              type="text"
              value={form.couponName}
              onChange={(e) => update('couponName', e.target.value)}
              placeholder="예: 신규 가입 15% 할인"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="할인율 (%)">
              <input
                type="number"
                min={1}
                max={100}
                value={form.discountRate}
                onChange={(e) => update('discountRate', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
              />
            </Field>
            <Field label="수량">
              <input
                type="number"
                min={1}
                value={form.amount}
                onChange={(e) => update('amount', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
              />
            </Field>
          </div>

          <Field label="발급 시작">
            <input
              type="datetime-local"
              value={form.startedAt}
              onChange={(e) => update('startedAt', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
            />
          </Field>

          <Field label="만료 일시">
            <input
              type="datetime-local"
              value={form.expiredAt}
              onChange={(e) => update('expiredAt', e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className={`mt-2 rounded-lg py-3 text-sm font-semibold text-white transition-colors ${
              submitting ? 'cursor-not-allowed bg-gray-300' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {submitting ? '생성 중...' : '쿠폰 템플릿 생성'}
          </button>
        </form>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  );
}
