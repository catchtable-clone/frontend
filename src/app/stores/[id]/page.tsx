'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Clock, MapPin, Heart, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import Header from '@/components/common/Header';
import { mockStores, mockMenus, mockFullyBookedDays } from '@/lib/mockData';

function getNextDays(count: number) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }
  return days;
}

function formatDate(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return { month, day, weekday };
}

export default function StoreDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const store = mockStores.find((s) => s.id === Number(id));
  const menus = mockMenus[Number(id)] || [];
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const days = getNextDays(14);
  const fullyBookedOffsets = mockFullyBookedDays[Number(id)] || [];
  const fullyBookedDates = new Set(
    fullyBookedOffsets.map((offset) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return d.toDateString();
    }),
  );
  const isSelectedFullyBooked = fullyBookedDates.has(selectedDate.toDateString());

  if (!store) {
    return (
      <>
        <Header title="매장 상세" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">매장을 찾을 수 없습니다</p>
        </main>
      </>
    );
  }

  const handleReserveClick = () => {
    setSelectedTime(null);
    setShowTimeModal(true);
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirmReservation = () => {
    if (!selectedTime) return;
    setShowTimeModal(false);
    router.push(
      `/reservation?storeId=${store.id}&date=${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}&time=${selectedTime}`,
    );
  };

  return (
    <>
      <Header title={store.name} showBack />

      <main className="flex-1">
        {/* 매장 이미지 */}
        <div className="h-48 w-full bg-gray-200" />

        {/* 매장 정보 */}
        <section className="border-b border-gray-100 px-4 py-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-gray-400">{store.category}</span>
              <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
            </div>
            <button className="rounded-full p-2 hover:bg-gray-100">
              <Heart size={22} className="text-gray-400" />
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star size={14} className="fill-orange-400 text-orange-400" />
              <span>
                {store.rating} ({store.reviewCount})
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} />
              <span>{store.address}</span>
              <button
                onClick={() =>
                  router.push(
                    `/map?lat=${store.lat}&lng=${store.lng}&storeId=${store.id}`,
                  )
                }
                className="ml-1 text-xs text-orange-500 hover:underline"
              >
                지도에서 보기
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} />
              <span>
                {store.openTime} - {store.closeTime}
              </span>
            </div>
          </div>
        </section>

        {/* 예약 가능 날짜 */}
        <section className="border-b border-gray-100 px-4 py-4">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            예약 가능 날짜
          </h3>
          {store.isClosed ? (
            <p className="text-sm text-gray-400">
              휴업중인 매장은 예약이 불가합니다.
            </p>
          ) : (
            <div className="flex gap-2 overflow-x-auto">
              {days.map((date) => {
                const { month, day, weekday } = formatDate(date);
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const isSelected =
                  date.toDateString() === selectedDate.toDateString();
                const isFullyBooked = fullyBookedDates.has(
                  date.toDateString(),
                );
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-lg border px-4 py-3 ${
                      isSelected && isFullyBooked
                        ? 'border-blue-400 bg-blue-50 text-blue-500'
                        : isSelected
                          ? 'border-orange-500 text-orange-500'
                          : isFullyBooked
                            ? 'border-gray-200 bg-gray-50 text-gray-400'
                            : 'border-gray-200 hover:border-orange-500 hover:text-orange-500'
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        isSelected && isFullyBooked
                          ? 'text-blue-400'
                          : isSelected
                            ? 'text-orange-400'
                            : 'text-gray-400'
                      }`}
                    >
                      {isToday ? '오늘' : `${month}월`}
                    </span>
                    <span className="text-lg font-semibold">{day}</span>
                    <span
                      className={`text-xs ${
                        isSelected && isFullyBooked
                          ? 'text-blue-400'
                          : isSelected
                            ? 'text-orange-400'
                            : isFullyBooked
                              ? 'text-gray-400'
                              : 'text-gray-500'
                      }`}
                    >
                      {isFullyBooked ? '마감' : weekday}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* 메뉴 */}
        <section className="px-4 py-4">
          <h3 className="mb-3 text-base font-semibold text-gray-900">메뉴</h3>
          <div className="flex flex-col gap-4">
            {menus.map((menu) => (
              <div key={menu.id} className="flex items-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-200" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {menu.name}
                  </p>
                  <p className="text-xs text-gray-500">{menu.description}</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {menu.price.toLocaleString()}원
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 예약하기 / 빈자리 알림 버튼 */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-3">
        {store.isClosed ? (
          <button
            disabled
            className="w-full cursor-not-allowed rounded-lg bg-gray-300 py-3 text-sm font-semibold text-white"
          >
            현재 휴업중입니다
          </button>
        ) : isSelectedFullyBooked ? (
          <button
            onClick={() =>
              alert(
                `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 빈자리 알림이 등록되었습니다.`,
              )
            }
            className="w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
          >
            빈자리 알림 등록
          </button>
        ) : (
          <button
            onClick={handleReserveClick}
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            예약하기
          </button>
        )}
      </div>

      {/* 시간 선택 팝업 */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowTimeModal(false)}
          />
          <div className="relative w-full max-w-[480px] rounded-t-2xl bg-white px-5 pb-5 pt-6">

            {/* 캘린더 */}
            <DayPicker
              mode="single"
              locale={ko}
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }
              }}
              disabled={{ before: new Date() }}
              fixedWeeks
              styles={{
                root: { width: '100%' },
                month: { width: '100%', position: 'relative', paddingTop: '40px' },
                month_grid: { width: '100%', tableLayout: 'fixed' },
                month_caption: { position: 'absolute', top: 0, left: 0, right: 0, height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 600, pointerEvents: 'none' },
                nav: { position: 'absolute', top: 0, left: '16px', right: '16px', height: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 },
                day: { textAlign: 'center' },
                weekday: { textAlign: 'center' },
                day_button: { margin: '0 auto', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' },
                selected: { background: 'transparent' },
                today: { fontWeight: 700 },
              }}
              classNames={{
                chevron: 'fill-orange-500',
              }}
              modifiersStyles={{
                selected: { background: 'transparent' },
                today: { color: '#f97316' },
              }}
            />

            {/* 시간 선택 */}
            <div className="mb-5 mt-2">
              <p className="mb-2 px-1 text-base font-medium text-gray-700">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 예약
                가능 시간
              </p>
              <div className="grid grid-cols-5 gap-2">
                {['11:00', '12:00', '13:00', '18:00', '19:00', '20:00'].map(
                  (time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeClick(time)}
                      className={`rounded-lg border py-2 text-sm font-medium ${
                        selectedTime === time
                          ? 'border-orange-500 bg-orange-50 text-orange-500'
                          : 'border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-500'
                      }`}
                    >
                      {time}
                    </button>
                  ),
                )}
              </div>
            </div>

            <button
              onClick={handleConfirmReservation}
              disabled={!selectedTime}
              className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors ${
                selectedTime
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : 'bg-gray-300'
              }`}
            >
              예약하기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
