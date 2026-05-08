import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBookmarkFolders,
  createBookmarkFolder,
  updateBookmarkFolder,
  deleteBookmarkFolder,
  getBookmarksInFolder,
  addBookmark,
  deleteBookmark,
} from '@/lib/bookmarkApi';
import { useAuthStore } from '@/stores/authStore';

const FOLDERS_KEY = ['bookmarkFolders'] as const;
const folderBookmarksKey = (folderId: number | null) =>
  ['bookmarkFolder', folderId, 'bookmarks'] as const;

/**
 * 내 북마크 폴더 목록 조회. 비로그인 시 비활성화.
 */
export const useBookmarkFoldersQuery = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: FOLDERS_KEY,
    queryFn: getBookmarkFolders,
    enabled: !!accessToken,
  });
};

/**
 * 특정 폴더의 매장(북마크) 목록 조회.
 */
export const useBookmarksInFolderQuery = (folderId: number | null) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: folderBookmarksKey(folderId),
    queryFn: () => getBookmarksInFolder(folderId as number),
    enabled: !!accessToken && folderId != null,
  });
};

export const useCreateBookmarkFolderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ folderName, color }: { folderName: string; color: string }) =>
      createBookmarkFolder(folderName, color),
    onSuccess: () => qc.invalidateQueries({ queryKey: FOLDERS_KEY }),
  });
};

export const useUpdateBookmarkFolderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      folderId,
      folderName,
      color,
    }: {
      folderId: number;
      folderName?: string;
      color?: string;
    }) => updateBookmarkFolder(folderId, { folderName, color }),
    onSuccess: () => qc.invalidateQueries({ queryKey: FOLDERS_KEY }),
  });
};

export const useDeleteBookmarkFolderMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (folderId: number) => deleteBookmarkFolder(folderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: FOLDERS_KEY }),
  });
};

export const useAddBookmarkMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ folderId, storeId }: { folderId: number; storeId: number }) =>
      addBookmark(folderId, storeId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: folderBookmarksKey(variables.folderId) });
      qc.invalidateQueries({ queryKey: FOLDERS_KEY });
    },
  });
};

export const useDeleteBookmarkMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookmarkId: number) => deleteBookmark(bookmarkId),
    onSuccess: () => {
      // 삭제는 어떤 폴더 소속인지 호출 측에서 알 수 없으므로 폴더 캐시 전체를 무효화
      qc.invalidateQueries({ queryKey: ['bookmarkFolder'] });
      qc.invalidateQueries({ queryKey: FOLDERS_KEY });
    },
  });
};
