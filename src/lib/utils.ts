import type { Store } from '@/types/store';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

export function formatDateParts(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS[date.getDay()];
  return { month, day, weekday };
}

export function formatDateDot(dateStr: string) {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}월 ${d}일`;
}

export function filterStores(stores: Store[], query: string) {
  const q = query.toLowerCase();
  return stores.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q),
  );
}
