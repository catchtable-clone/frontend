'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Send, Bot, X, Minus } from 'lucide-react';
import type { ChatMessage } from '@/types/store';

const QUICK_PROMPTS = [
  '내 주변 맛집 추천해줘',
  '오늘 저녁 예약 가능한 곳',
  '강남 일식 추천',
  '이번 주말 2명 예약',
];

const MOCK_RESPONSES: Record<string, string> = {
  '내 주변 맛집 추천해줘':
    '현재 위치 기준으로 인기 매장을 추천해드릴게요!\n\n🍣 **스시 소라** (일식) - ★4.8\n서울 강남구 역삼동\n\n🍚 **모수 서울** (한식) - ★4.9\n서울 용산구 한남동\n\n☕ **카페 온도** (카페) - ★4.7\n서울 성동구 성수동\n\n예약을 원하시면 매장명과 날짜, 시간, 인원을 알려주세요!',
  '오늘 저녁 예약 가능한 곳':
    '오늘 저녁 예약 가능한 매장이에요!\n\n🍣 **스시 소라** - 18:00, 19:00, 20:00\n🍜 **라멘 이찌** - 18:00, 19:00\n☕ **카페 온도** - 18:00, 19:00, 20:00\n\n예약하고 싶은 매장과 시간을 말씀해주세요!',
  '강남 일식 추천':
    '강남 근처 일식 매장을 추천해드릴게요!\n\n🍣 **스시 소라** - ★4.8 (리뷰 324개)\n서울 강남구 역삼동 | 11:00~22:00\n오마카세 코스 150,000원~\n\n🍜 **라멘 이찌** - ★4.6 (리뷰 287개)\n서울 강남구 신사동 | 11:00~21:00\n돈코츠 라멘 12,000원~\n\n예약을 도와드릴까요?',
  '이번 주말 2명 예약':
    '이번 주말 2명 예약을 도와드릴게요! 어떤 매장을 원하시나요?\n\n현재 주말 예약 가능한 매장:\n• 스시 소라 (토 18:00, 일 12:00)\n• 모수 서울 (토 19:00)\n• 카페 온도 (토·일 전 시간대)\n\n매장명과 원하시는 시간을 알려주세요!',
};

const DEFAULT_RESPONSE =
  '죄송합니다, 정확히 이해하지 못했어요. 다음과 같이 말씀해보세요:\n\n• "내 주변 맛집 추천해줘"\n• "스시 소라 내일 18시 2명 예약"\n• "강남 일식 추천"\n\n자연어로 편하게 말씀해주시면 도와드릴게요!';

export default function FloatingChat() {
  const pathname = usePathname();
  const hideButton = pathname === '/map';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // 초기 위치 설정
  useEffect(() => {
    if (!positioned) {
      const containerWidth = Math.min(480, window.innerWidth);
      const offsetLeft = (window.innerWidth - containerWidth) / 2;
      setBtnPos({
        x: offsetLeft + containerWidth - 14 - 56,
        y: window.innerHeight - 80 - 56,
      });
      setPositioned(true);
    }
  }, [positioned]);

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

  const showIntro = messages.length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'USER',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = MOCK_RESPONSES[text.trim()] || DEFAULT_RESPONSE;
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'ASSISTANT',
        content: responseText,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
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
                  setMessages([]);
                  setInput('');
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
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
              {messages.map((msg) => (
                <div
                  key={msg.id}
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
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>
                        {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                          part.startsWith('**') && part.endsWith('**') ? (
                            <strong key={j}>{part.slice(2, -2)}</strong>
                          ) : (
                            <span key={j}>{part}</span>
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

              <div ref={messagesEndRef} />
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
                placeholder="메시지를 입력하세요..."
                disabled={isTyping}
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
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
