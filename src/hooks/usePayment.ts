'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { confirmPayment } from '@/lib/api/paymentApi';
import { cancelReservation } from '@/lib/reservationApi';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

interface PaymentParams {
  reservationId: number;
  orderId: string;
  amount: number;
}

export function usePayment(options?: { onSettled?: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const { userId } = useAuthStore();

  const processPayment = async ({ reservationId, orderId, amount }: PaymentParams) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const PortOne = await import('@portone/browser-sdk/v2');
      // @ts-expect-error SDK 타입 버그 (alipayPlus required but unused)
      const paymentResult = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        paymentId: orderId,
        orderName: '예약 예치금',
        totalAmount: amount,
        currency: 'CURRENCY_KRW',
        payMethod: 'EASY_PAY',
        easyPay: { easyPayProvider: 'KAKAOPAY' },
      });

      if (paymentResult?.code != null) {
        await cancelReservation(reservationId).catch(() => {});
        toast.error('결제가 취소되었습니다. 예약이 취소됩니다.');
      } else {
        await confirmPayment(orderId);
        toast.success('예약이 확정되었습니다!');
      }

      queryClient.invalidateQueries({ queryKey: ['reservations', userId] });
    } catch {
      toast.error('결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
      options?.onSettled?.();
    }
  };

  return { processPayment, isProcessing };
}
