/**
 * 백엔드 Category enum과 한국어 표시명 매핑
 */
export const CATEGORY_LABELS: Record<string, string> = {
  KOREAN: '한식',
  JAPANESE: '일식',
  CHINESE: '중식',
  WESTERN: '양식',
  DESSERT: '디저트',
  CHICKEN: '치킨',
  MEAT: '고기',
  FISH: '횟집',
  FASTFOOD: '패스트푸드',
  FOREIGN: '외국음식',
  BUFFET: '뷔페',
  OTHERS: '기타',
};

export const CATEGORY_ENUMS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_LABELS).map(([enumKey, label]) => [label, enumKey]),
);

export const CATEGORY_ICONS: Record<string, string> = {
  KOREAN: '🍚',
  JAPANESE: '🍣',
  CHINESE: '🥟',
  WESTERN: '🍝',
  DESSERT: '☕',
  CHICKEN: '🍗',
  MEAT: '🥩',
  FISH: '🐟',
  FASTFOOD: '🍔',
  FOREIGN: '🌮',
  BUFFET: '🍽️',
  OTHERS: '🍴',
};

/**
 * 백엔드 District enum과 한국어 표시명 매핑
 */
export const DISTRICT_LABELS: Record<string, string> = {
  JONGNO: '종로구',
  JUNG: '중구',
  YONGSAN: '용산구',
  SEONGDONG: '성동구',
  GWANGJIN: '광진구',
  DONGDAEMUN: '동대문구',
  JUNGNANG: '중랑구',
  SEONGBUK: '성북구',
  GANGBUK: '강북구',
  DOBONG: '도봉구',
  NOWON: '노원구',
  EUNPYEONG: '은평구',
  SEODAEMUN: '서대문구',
  MAPO: '마포구',
  YANGCHEON: '양천구',
  GANGSEO: '강서구',
  GURO: '구로구',
  GEUMCHEON: '금천구',
  YEONGDEUNGPO: '영등포구',
  DONGJAK: '동작구',
  GWANAK: '관악구',
  SEOCHO: '서초구',
  GANGNAM: '강남구',
  SONGPA: '송파구',
  GANGDONG: '강동구',
};

export const DISTRICT_ENUMS: Record<string, string> = Object.fromEntries(
  Object.entries(DISTRICT_LABELS).map(([enumKey, label]) => [label, enumKey]),
);

export const toCategoryLabel = (categoryEnum?: string): string =>
  categoryEnum ? CATEGORY_LABELS[categoryEnum] ?? categoryEnum : '';

export const toCategoryEnum = (label?: string): string | undefined =>
  label ? CATEGORY_ENUMS[label] : undefined;

export const toDistrictLabel = (districtEnum?: string): string =>
  districtEnum ? DISTRICT_LABELS[districtEnum] ?? districtEnum : '';

export const toDistrictEnum = (label?: string): string | undefined =>
  label ? DISTRICT_ENUMS[label] : undefined;
