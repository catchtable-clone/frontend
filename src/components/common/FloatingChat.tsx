'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Send, Bot, X, Minus, Loader2 } from 'lucide-react';
import { useChatMessagesQuery, useSendChatMessageMutation } from '@/lib/chatQuery';
import { useAuthStore } from '@/stores/authStore';
import type { ChatMessage } from '@/types/store';

const QUICK_PROMPTS = [
  '내 주변 맛집 추천해줘',
  '오늘 저녁 예약 가능한 곳',
  '강남 일식 추천',
  '이번 주말 2명 예약',
];

export default function FloatingChat() {
  const pathname = usePathname();
  const hideButton = pathname === '/map';
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const { accessToken } = useAuthStore();
  const isLoggedIn = !!accessToken;

  // 채팅창이 열리고 로그인 상태일 때만 채팅 내역을 가져옵니다.
  const { data: messages = [], isLoading: isLoadingHistory } = useChatMessagesQuery(isOpen && isLoggedIn);
  const sendChatMessageMutation = useSendChatMessageMutation();
  const isTyping = sendChatMessageMutation.isPending;

  const calcDefaultPos = () => {
    const containerWidth = Math.min(480, window.innerWidth);
    const offsetLeft = (window.innerWidth - containerWidth) / 2;
    return {
      x: offsetLeft + containerWidth - 14 - 56,
      y: window.innerHeight - 80 - 56,
    };
  };

  // 초기 위치 설정
  useEffect(() => {
    if (!positioned) {
      setBtnPos(calcDefaultPos());
      setPositioned(true);
    }
  }, [positioned]);

  // 윈도우 리사이즈 시 위치 재계산
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
    // 채팅창이 열리거나, 메시지 목록이 변경되거나, AI가 응답 중일 때 스크롤을 맨 아래로 이동시킵니다.
    // 이렇게 하면 사용자가 스크롤을 위로 올렸다가 다시 켜도 항상 최신 메시지를 볼 수 있습니다.
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [isOpen, messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim() || !isLoggedIn || isTyping) return;

    sendChatMessageMutation.mutate(text.trim());
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* 플로팅 버튼 (드래그 가능) */}
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
          style={{
            left: `${btnPos.x}px`,
            top: `${btnPos.y}px`,
            touchAction: 'none',
          }}
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
          <div className="flex items-center justify-between rounded-t-2xl bg-gray-900 px-4 py-3">
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
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:text-white"
              >
                <Minus size={18} />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setInput('');
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 채팅 영역 */}
          <div
            ref={scrollContainerRef}
            className="flex flex-1 flex-col overflow-y-auto bg-gray-50"
          >
            {/* 로그인 안된 경우 */}
            {!isLoggedIn && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
                <Bot size={32} className="text-gray-400" />
                <p className="text-sm text-gray-600">로그인 후 AI 챗봇을 이용해보세요.</p>
              </div>
            )}

            {/* 히스토리 로딩 중 */}
            {isLoggedIn && isLoadingHistory && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-gray-400" />
                <p className="text-xs text-gray-400">
                  대화 내역을 불러오는 중...
                </p>
              </div>
            )}

            {/* 인트로 */}
            {showIntro && (
              <div className="mx-4 mt-4 rounded-xl bg-gray-900 p-4 text-white">
                <p className="text-sm leading-relaxed">
                  안녕하세요! 맛집 추천과 예약을 도와드리는
                  <br />
                  CatchEat AI 에이전트입니다.
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  자연어로 편하게 말씀해주세요.
                </p>
              </div>
            )}

            {/* 빠른 질문 칩 */}
            {showIntro && (
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:border-orange-400 hover:text-orange-500"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
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
        {msg.content.split('\n').map((line: string, i: number) => (
          <span key={`${msg.id ?? msgIndex}-line-${i}`}>
            {line.split(/(\*\*.*?\*\*)/).map((part: string, j: number) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={`${msg.id ?? msgIndex}-line-${i}-part-${j}`}>{part.slice(2, -2)}</strong>
              ) : (
                <span key={`${msg.id ?? msgIndex}-line-${i}-part-${j}`}>{part}</span>
              ),
            )}
            {i < msg.content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  ))}

              {/* 타이핑 인디케이터 */}
              {isTyping && (
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

            </div>
          </div>

          {/* 입력창 */}
          <div className="border-t border-gray-200 bg-white px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoggedIn ? '메시지를 입력하세요...' : '로그인이 필요합니다.'}
                disabled={isTyping || !isLoggedIn}
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping || !isLoggedIn}
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
