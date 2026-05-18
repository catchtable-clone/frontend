'use client';

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Send, Bot, X, Minus, Loader2, CreditCard } from 'lucide-react';
import { useChatMessagesQuery } from '@/lib/chatQuery';
import { sendChatMessage } from '@/lib/api/chat';
import { useAuthStore } from '@/stores/authStore';
import { usePayment } from '@/hooks/usePayment';
import { useQueryClient } from '@tanstack/react-query';
import { CHAT_MESSAGES_QUERY_KEY } from '@/lib/chatQuery';
import type { ChatMessage, PendingPaymentInfo } from '@/types/store';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  '내 주변 맛집 추천해줘',
  '내 예약 보여줘',
  '취소된 예약 보여줘'
];


export default function FloatingChat() {
  const pathname = usePathname();
  const router = useRouter();
  const hideButton = pathname === '/map';
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationDenied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // 드래그 상태
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });
  const [positioned, setPositioned] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    dragging: boolean;
    moved: boolean;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  }>({ dragging: false, moved: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PendingPaymentInfo | null>(null);
  const { processPayment, isProcessing: isPaymentProcessing } = usePayment({
    onSettled: () => setPendingPayment(null),
  });

  const { accessToken, userId } = useAuthStore();
  const isLoggedIn = !!accessToken;

  const { data: serverMessages = [], isLoading: isLoadingHistory } = useChatMessagesQuery(isOpen && isLoggedIn);

  const messages: ChatMessage[] = serverMessages;

  const calcDefaultPos = () => {
    const containerWidth = Math.min(480, window.innerWidth);
    const offsetLeft = (window.innerWidth - containerWidth) / 2;
    return {
      x: offsetLeft + containerWidth - 14 - 56,
      y: window.innerHeight - 80 - 56,
    };
  };

  useEffect(() => {
    if (!positioned) {
      setBtnPos(calcDefaultPos());
      setPositioned(true);
    }
  }, [positioned]);

  useEffect(() => {
    const handleResize = () => {
      if (!dragRef.current.dragging) {
        setBtnPos((prev) => {
          const clampedX = Math.min(prev.x, window.innerWidth - 56);
          const clampedY = Math.max(60, Math.min(prev.y, window.innerHeight - 56));
          return { x: clampedX, y: clampedY };
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - btnPos.x,
      offsetY: e.clientY - btnPos.y,
    };
    btnRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = Math.abs(e.clientX - dragRef.current.startX);
    const dy = Math.abs(e.clientY - dragRef.current.startY);
    if (dx > 3 || dy > 3) {
      dragRef.current.moved = true;
      setIsDragging(true);
    }
    const newX = e.clientX - dragRef.current.offsetX;
    const newY = e.clientY - dragRef.current.offsetY;
    const clampedX = Math.max(0, Math.min(newX, window.innerWidth - 56));
    const clampedY = Math.max(60, Math.min(newY, window.innerHeight - 56));
    setBtnPos({ x: clampedX, y: clampedY });
  };

  const snapToEdge = (x: number, y: number) => {
    const containerWidth = Math.min(480, window.innerWidth);
    const offsetLeft = (window.innerWidth - containerWidth) / 2;
    const padding = 16;
    const btnSize = 56;
    const leftX = offsetLeft + padding;
    const rightX = offsetLeft + containerWidth - padding - btnSize;
    const topY = 60;
    const bottomY = window.innerHeight - 80 - btnSize;
    const centerX = x + btnSize / 2;
    const containerCenterX = offsetLeft + containerWidth / 2;
    const snapX = centerX < containerCenterX ? leftX : rightX;
    const clampedY = Math.max(topY, Math.min(y, bottomY));
    return { x: snapX, y: clampedY };
  };

  const handlePointerUp = () => {
    if (!dragRef.current.moved) {
      setIsOpen(true);
    } else {
      setBtnPos(snapToEdge(btnPos.x, btnPos.y));
    }
    dragRef.current.dragging = false;
    setIsDragging(false);
  };

  const showIntro = messages.length === 0 && !isLoadingHistory && isLoggedIn;

  useLayoutEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || coords || locationDenied) return;
    // TODO: 개발 환경 테스트용 하드코딩 좌표 — main 머지 전 아래 geolocation으로 교체
    setCoords({ latitude: 37.491750, longitude: 127.007696 });
    // navigator.geolocation?.getCurrentPosition(
    //   (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
    //   () => setLocationDenied(true),
    //   { timeout: 5000 },
    // );
  }, [isOpen, coords, locationDenied]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !isLoggedIn || isLoading) return;

    const msgText = text.trim();
    setInput('');
    setPendingPayment(null);
    setPendingUserMessage(msgText);
    setIsLoading(true);

    try {
      const result = await sendChatMessage(msgText, coords ?? undefined);
      if (result.pendingPayment) {
        setPendingPayment(result.pendingPayment);
      }
      queryClient.invalidateQueries({ queryKey: CHAT_MESSAGES_QUERY_KEY(userId ?? null) });
    } catch {
      toast.error('응답을 받지 못했습니다. 다시 시도해주세요.');
    } finally {
      setPendingUserMessage(null);
      setIsLoading(false);
    }
  }, [isLoggedIn, isLoading, userId, queryClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handlePayment = () => {
    if (!pendingPayment) return;
    processPayment(pendingPayment);
  };

  const renderInline = (text: string, baseKey: number) =>
    text.split(/(\*\*.*?\*\*|\[.*?\]\(\/stores\/\d+\))/).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${baseKey}-${j}`}>{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/^\[(.*?)\]\((\/stores\/\d+)\)$/);
      if (linkMatch) {
        return (
          <button
            key={`${baseKey}-${j}`}
            onClick={() => { setIsOpen(false); router.push(linkMatch[2]); }}
            className="font-semibold text-orange-500 underline underline-offset-2 hover:text-orange-600"
          >
            {linkMatch[1]}
          </button>
        );
      }
      return <span key={`${baseKey}-${j}`}>{part}</span>;
    });

  const renderMessageContent = (content: string) =>
    content.split('\n').map((line: string, i: number, arr: string[]) => (
      <span key={i}>
        {renderInline(line, i)}
        {i < arr.length - 1 && <br />}
      </span>
    ));

  return (
    <>
      {/* 플로팅 버튼 */}
      {!isOpen && !hideButton && positioned && (
        <button
          ref={btnRef}
          aria-label="챗봇 열기"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`fixed z-[60] flex h-14 w-14 cursor-grab items-center justify-center rounded-full bg-gray-900 text-white shadow-lg active:cursor-grabbing ${
            isDragging ? '' : 'transition-[left,top] duration-300 ease-out'
          }`}
          style={{ left: `${btnPos.x}px`, top: `${btnPos.y}px`, touchAction: 'none' }}
        >
          <Bot size={24} />
        </button>
      )}

      {/* 챗봇 창 */}
      {isOpen && (
        <div
          className="fixed bottom-0 z-[60] flex flex-col rounded-t-2xl border border-gray-200 bg-white shadow-2xl"
          style={{
            width: 'min(480px, 100vw)',
            height: '70vh',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* 헤더 */}
          <div className="rounded-t-2xl bg-gray-900">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">CatchEat AI</p>
                  <p className="text-[11px] text-green-400">온라인</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowGuide((v) => !v)}
                  className="rounded-lg px-2 py-1 text-xs text-gray-200 hover:text-white"
                >
                  {showGuide ? '챗봇 사용 예시 ▲' : '챗봇 사용 예시 ▼'}
                </button>
                <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:text-white">
                  <Minus size={18} />
                </button>
                <button
                  onClick={() => { setIsOpen(false); setInput(''); }}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {showGuide && (
              <ul className="space-y-2 border-t border-gray-700 px-4 py-3 text-xs text-white">
                <li>• 로코페페 5월 25일 저녁 7시 2명 예약해줘</li>
                <li>• 내 주변 인기 맛집 추천해줘</li>
                <li>• 내 예약 보여줘 / 취소해줘</li>
                <li>• 취소된 예약 보여줘</li>
                <li>• 로코페페 내일 예약 가능한 시간 알려줘</li>
              </ul>
            )}
          </div>

          {/* 채팅 영역 */}
          <div ref={scrollContainerRef} className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
            {!isLoggedIn && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
                <Bot size={32} className="text-gray-400" />
                <p className="text-sm text-gray-600">로그인 후 AI 챗봇을 이용해보세요.</p>
              </div>
            )}

            {isLoggedIn && isLoadingHistory && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-gray-400" />
                <p className="text-xs text-gray-400">대화 내역을 불러오는 중...</p>
              </div>
            )}

            {showIntro && (
              <div className="mx-4 mt-4 rounded-xl bg-gray-900 p-4 text-white">
                <p className="text-sm leading-relaxed">
                  안녕하세요! 맛집 추천과 예약을 도와드리는
                  <br />
                  CatchEat AI 에이전트입니다.
                </p>
                <p className="mt-2 text-xs text-gray-400">자연어로 편하게 말씀해주세요.</p>
              </div>
            )}

            {showIntro && (
              <div className="h-0" />
            )}

            {/* 메시지 목록 */}
            <div className="flex flex-1 flex-col gap-3 px-4 py-3">
              {messages.map((msg, msgIndex) => (
                <div
                  key={msg.id ?? `msg-${msgIndex}`}
                  className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ASSISTANT' && (
                    <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-900">
                      <Bot size={12} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      msg.role === 'USER'
                        ? 'rounded-br-md bg-orange-500 text-white'
                        : 'rounded-bl-md bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              ))}

              {/* 전송 중인 내 메시지 (낙관적 표시) */}
              {pendingUserMessage && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-orange-500 px-3.5 py-2 text-sm leading-relaxed text-white">
                    {pendingUserMessage}
                  </div>
                </div>
              )}

              {/* 로딩 인디케이터 */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-900">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}

              {/* 결제 버튼 */}
              {pendingPayment && !isLoading && (
                <div className="flex justify-start">
                  <div className="mr-2 mt-1 h-7 w-7 flex-shrink-0" />
                  <button
                    onClick={handlePayment}
                    disabled={isPaymentProcessing}
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-60"
                  >
                    <CreditCard size={16} />
                    {isPaymentProcessing ? '결제 진행 중...' : '결제하고 예약 확정하기 (10,000원)'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 입력창 */}
          <div className="border-t border-gray-200 bg-white px-4 pb-3 pt-2">
            {isLoggedIn && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt) => {
                  const isLocation = prompt === '내 주변 맛집 추천해줘';
                  const handleClick = () => {
                    if (isLocation && locationDenied) {
                      toast.error('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.');
                      return;
                    }
                    if (isLocation && !coords) {
                      toast('위치 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
                      return;
                    }
                    sendMessage(prompt);
                  };
                  return (
                    <button
                      key={prompt}
                      onClick={handleClick}
                      disabled={isLoading}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:border-orange-400 hover:text-orange-500 disabled:opacity-40"
                    >
                      {prompt}
                    </button>
                  );
                })}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoggedIn ? '메시지를 입력하세요...' : '로그인이 필요합니다.'}
                disabled={isLoading || !isLoggedIn}
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || !isLoggedIn}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:bg-gray-300"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
