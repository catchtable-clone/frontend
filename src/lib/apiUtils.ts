/**
 * 백엔드 ApiResponse 래핑(`{ status, message, data }`) 안의 실제 데이터를 추출.
 * 다양한 필드명(data/result) 또는 raw 응답 모두 지원.
 *
 * 모든 *Api.ts 파일은 이 헬퍼를 import해서 사용한다.
 */
export const unwrap = <T>(response: { data: any }, fallback: T): T => {
  const body = response.data;
  return (body?.data ?? body?.result ?? body ?? fallback) as T;
};
