import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, sendChatMessage } from './api/chat';
import type { ChatMessage } from '@/types/store';
// React Query 캐시 키 상수
export const CHAT_MESSAGES_QUERY_KEY = ['chatMessages'];

/**
 * 채팅 메시지 목록을 가져오는 React Query 훅
 * @param enabled 쿼리를 활성화할지 여부
 */
export const useChatMessagesQuery = (enabled: boolean) => {
  return useQuery<ChatMessage[]>({
    queryKey: CHAT_MESSAGES_QUERY_KEY,
    queryFn: getChatMessages,
    enabled,
    staleTime: Infinity, // 채팅 내역은 사용자가 직접 보내기 전까지는 바뀌지 않음
    retry: false, // 로그인 안되어있을 때 401 에러 재시도 방지
  });
};

/**
 * 새 채팅 메시지를 보내는 React Query 뮤테이션 훅
 */
export const useSendChatMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendChatMessage,
    // onMutate를 사용하여 사용자 메시지를 서버 응답 전에 즉시 UI에 표시 (낙관적 업데이트)
    onMutate: async (newMessageContent: string) => {
      // 진행중인 refetch를 취소합니다.
      await queryClient.cancelQueries({ queryKey: CHAT_MESSAGES_QUERY_KEY });

      // 롤백을 위해 이전 메시지 목록을 스냅샷합니다.
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(CHAT_MESSAGES_QUERY_KEY);

      // 사용자 메시지를 낙관적으로 추가합니다.
      const userMessage: ChatMessage = {
        // Math.random()을 사용하여 임시 ID를 생성합니다.
        // 카운터 방식은 개발 환경의 HMR(Hot Module Replacement)과 복잡하게 얽히며 ID 충돌을 일으키는 것으로 보입니다.
        // 상태를 가지지 않는 Math.random()이 가장 안정적인 해결책입니다. 충돌 확률은 실질적으로 0에 가깝습니다.
        id: Math.random(),
        role: 'USER',
        content: newMessageContent,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<ChatMessage[]>(CHAT_MESSAGES_QUERY_KEY, (old = []) => [...old, userMessage]);

      return { previousMessages };
    },
    // 에러 발생 시 onMutate에서 변경한 내용을 롤백
    onError: (err, newMessage, context) => {
      queryClient.setQueryData(CHAT_MESSAGES_QUERY_KEY, context?.previousMessages);
    },
    // 성공/실패 여부와 관계없이, 항상 최신 데이터로 다시 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_MESSAGES_QUERY_KEY });
    },
  });
};