'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Clock, MapPin, Heart, Check, Plus } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import Header from '@/components/common/Header';
import BottomSheet from '@/components/common/BottomSheet';
import CenteredModal from '@/components/common/CenteredModal';
import { mockStores, mockMenus, mockFullyBookedDays, mockBookmarkFolders, mockStoreReviews } from '@/lib/mockData';
import StarRating from '@/components/common/StarRating';
import { formatDateParts, formatDateDot } from '@/lib/utils';
import FolderFormModal from '@/components/common/FolderFormModal';
import type { BookmarkFolder } from '@/types/store';

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
  const [showFolderSheet, setShowFolderSheet] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [folders, setFolders] = useState<BookmarkFolder[]>(mockBookmarkFolders);
  const [showNewFolder, setShowNewFolder] = useState(false);

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

  const currentFolder = folders.find((f) =>
    f.storeIds.includes(store.id),
  ) || null;

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
            <button
              onClick={() => {
                if (currentFolder) {
                  setFolders((prev) =>
                    prev.map((f) =>
                      f.id === currentFolder.id
                        ? { ...f, storeIds: f.storeIds.filter((sid) => sid !== store.id) }
                        : f,
                    ),
                  );
                } else {
                  setShowFolderSheet(true);
                }
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <Heart
                size={22}
                className={
                  currentFolder
                    ? 'fill-current'
                    : 'text-gray-400'
                }
                style={currentFolder ? { color: currentFolder.color } : undefined}
              />
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
                const { month, day, weekday } = formatDateParts(date);
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

        {/* 리뷰 */}
        <section className="border-t border-gray-100 px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              리뷰 ({(mockStoreReviews[store.id] || []).length})
            </h3>
          </div>
          {(mockStoreReviews[store.id] || []).length > 0 ? (
            <div className="flex flex-col gap-4">
              {(mockStoreReviews[store.id] || []).map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-50 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                        {review.userName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {review.userName}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={review.rating} size={12} />
                          <span className="text-[11px] text-gray-400">
                            {formatDateDot(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-gray-400">
              아직 리뷰가 없습니다
            </p>
          )}
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
        <BottomSheet onClose={() => setShowTimeModal(false)}>
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
        </BottomSheet>
      )}

      {/* 즐겨찾기 폴더 선택 모달 */}
      {showFolderSheet && (
        <CenteredModal onClose={() => setShowFolderSheet(false)}>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            즐겨찾기 폴더 선택
          </h3>

            <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
              {folders.map((folder) => {
                const isSelected = selectedFolderId === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3.5 ${
                      isSelected
                        ? ''
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    style={isSelected ? { borderColor: folder.color, backgroundColor: `${folder.color}15` } : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span
                        className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}
                      >
                        {folder.name}
                      </span>
                    </div>
                    {isSelected && (
                      <Check size={18} style={{ color: folder.color }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 새 폴더 만들기 */}
            <button
              onClick={() => setShowNewFolder(true)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
            >
              <Plus size={14} />
              새 폴더 만들기
            </button>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  if (selectedFolderId) {
                    setFolders((prev) =>
                      prev.map((f) => ({
                        ...f,
                        storeIds:
                          f.id === selectedFolderId
                            ? [...f.storeIds.filter((sid) => sid !== store.id), store.id]
                            : f.storeIds.filter((sid) => sid !== store.id),
                      })),
                    );
                  }
                  setShowFolderSheet(false);
                  setSelectedFolderId(null);
                }}
                disabled={!selectedFolderId}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white ${
                  selectedFolderId
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-300'
                }`}
              >
                확인
              </button>
              <button
                onClick={() => {
                  setShowFolderSheet(false);
                  setSelectedFolderId(null);
                }}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
            </div>
        </CenteredModal>
      )}

      {/* 새 폴더 만들기 모달 */}
      {showNewFolder && (
        <FolderFormModal
          mode="create"
          onSubmit={(name, color) => {
            const newFolder: BookmarkFolder = {
              id: Math.max(...folders.map((f) => f.id)) + 1,
              name,
              type: 'CUSTOM',
              color,
              storeIds: [],
            };
            setFolders((prev) => [...prev, newFolder]);
            setSelectedFolderId(newFolder.id);
            setShowNewFolder(false);
          }}
          onClose={() => setShowNewFolder(false)}
        />
      )}
    </>
  );
}
