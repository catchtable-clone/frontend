import api from '../axios';
import type { ChatMessage } from '@/types/store';

/**
 * 현재 사용자의 이전 채팅 메시지 목록을 가져옵니다.
 */
export const getChatMessages = async (): Promise<ChatMessage[]> => {
  const { data } = await api.get('/chat/messages');
  return data.data;
};

interface SendChatMessageResponse {
  id: number;
  reply: string;
}

/**
 * 챗봇에게 새 메시지를 보냅니다.
 * @param message 사용자가 보낼 메시지
 * @returns 봇의 응답 메시지 정보
 */
export const sendChatMessage = async (message: string): Promise<SendChatMessageResponse> => {
  const { data } = await api.post('/chat/messages', { message });
  return data.data;
};