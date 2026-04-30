import api from '@/lib/axios';
import { unwrap } from '@/lib/apiUtils';

/**
 * 백엔드 BookmarkFolderListResponse와 1:1 매칭.
 * folderType: 'DEFAULT' | 'CUSTOM'
 */
export interface BookmarkFolderResponse {
  folderId: number;
  folderName: string;
  color: string;
  folderType: 'DEFAULT' | 'CUSTOM';
}

/**
 * 백엔드 BookmarkListResponse와 1:1 매칭.
 * category: Category enum 문자열 (KOREAN, JAPANESE, ...)
 */
export interface BookmarkResponse {
  bookmarkId: number;
  storeId: number;
  storeName: string;
  storeImage: string | null;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
}

// ===== 폴더 =====

export const getBookmarkFolders = async (): Promise<BookmarkFolderResponse[]> => {
  const response = await api.get('/bookmark-folders');
  return unwrap<BookmarkFolderResponse[]>(response, []);
};

export const createBookmarkFolder = async (
  folderName: string,
  color: string,
): Promise<{ folderId: number }> => {
  const response = await api.post('/bookmark-folders', { folderName, color });
  return unwrap<{ folderId: number }>(response, { folderId: 0 });
};

export const updateBookmarkFolder = async (
  folderId: number,
  data: { folderName?: string; color?: string },
): Promise<{ folderId: number; folderName: string; color: string }> => {
  const response = await api.patch(`/bookmark-folders/${folderId}`, data);
  return unwrap<{ folderId: number; folderName: string; color: string }>(response, {
    folderId,
    folderName: '',
    color: '',
  });
};

export const deleteBookmarkFolder = async (folderId: number): Promise<void> => {
  await api.delete(`/bookmark-folders/${folderId}`);
};

// ===== 북마크(매장) =====

export const getBookmarksInFolder = async (folderId: number): Promise<BookmarkResponse[]> => {
  const response = await api.get(`/bookmark-folders/${folderId}/bookmarks`);
  return unwrap<BookmarkResponse[]>(response, []);
};

export const addBookmark = async (
  folderId: number,
  storeId: number,
): Promise<{ bookmarkId: number }> => {
  const response = await api.post(`/bookmark-folders/${folderId}/bookmarks`, { storeId });
  return unwrap<{ bookmarkId: number }>(response, { bookmarkId: 0 });
};

export const deleteBookmark = async (bookmarkId: number): Promise<void> => {
  await api.delete(`/bookmarks/${bookmarkId}`);
};
