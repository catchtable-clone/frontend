import api from '@/lib/axios';
import { unwrap } from '@/lib/apiUtils';

export type UploadType = 'store' | 'menu';

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
