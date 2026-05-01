// filterStores는 호출 측의 매장 형태(StoreSummary 또는 map 페이지의 로컬 형태)와
// 무관하게 작동하도록 제네릭으로 둔다.

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

/**
 * 클라이언트 측 매장 검색 필터.
 * 매장 객체에 존재하는 텍스트 필드(storeName/name, category, address)에 대해
 * query 문자열이 포함되는지 검사한다.
 *
 * 백엔드 StoreSummary(storeName)와 지도 페이지의 로컬 매장 형태(name)에 모두 호환.
 */
export function filterStores<
  T extends {
    storeName?: string;
    name?: string;
    category?: string;
    address?: string;
  },
>(stores: T[], query: string): T[] {
  const q = query.toLowerCase();
  return stores.filter((s) => {
    const fields = [s.storeName, s.name, s.category, s.address];
    return fields.some((v) => typeof v === 'string' && v.toLowerCase().includes(q));
  });
}
