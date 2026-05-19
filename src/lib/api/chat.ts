import api from '../axios';
import type { ChatMessage, PendingPaymentInfo } from '@/types/store';

export const getChatMessages = async (): Promise<ChatMessage[]> => {
  const { data } = await api.get('/chat/messages');
  return data.data;
};

export interface SendChatMessageResponse {
  id: number;
  reply: string;
  pendingPayment?: PendingPaymentInfo;
}

export const sendChatMessage = async (
  message: string,
  coords?: { latitude: number; longitude: number },
): Promise<SendChatMessageResponse> => {
  const { data } = await api.post('/chat/messages', { message, ...coords });
  return data.data;
};
