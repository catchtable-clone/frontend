import api from '@/lib/axios';

export const confirmPayment = async (paymentId: string): Promise<void> => {
  await api.post('/payments/confirm', { paymentId });
};
