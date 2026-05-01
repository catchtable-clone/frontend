import api from '@/lib/axios';
import { unwrap } from '@/lib/apiUtils';

export type UploadType = 'store' | 'menu';

/**
 * 이미지 파일 업로드 후 접근 가능한 URL 반환
 *
 * 저장 폴더 구조:
 * - type='store' + storeId → uploads/stores/{storeId}/store/{uuid}.ext
 * - type='menu'  + storeId → uploads/stores/{storeId}/menus/{uuid}.ext
 *
 * @param file 업로드할 이미지 파일 (jpg/png/webp, 최대 5MB)
 * @param type 업로드 대상 ('store' | 'menu')
 * @param storeId 매장 ID (type='store'/'menu' 모두 필수)
 */
export const uploadFile = async (
  file: File,
  type: UploadType,
  storeId?: number,
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const params: Record<string, string> = { type };
  if (storeId !== undefined) params.storeId = String(storeId);

  const response = await api.post('/files', formData, {
    params,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<{ url: string }>(response, { url: '' }).url;
};
