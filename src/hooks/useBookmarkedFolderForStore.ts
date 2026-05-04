'use client';

import { useQueries } from '@tanstack/react-query';
import { useBookmarkFoldersQuery } from '@/lib/bookmarkQuery';
import { getBookmarksInFolder } from '@/lib/bookmarkApi';
import { useAuthStore } from '@/stores/authStore';

/**
 * 주어진 storeId가 사용자의 어느 북마크 폴더에 속해 있는지 조회.
 * 매장 카드 같은 곳에서 하트 색상을 결정하는 데 사용한다.
 *
 * 구현:
 *  - 폴더 목록을 받은 뒤, 각 폴더의 매장 목록을 useQueries로 병렬 조회
 *  - 모든 결과는 TanStack Query 캐시에 저장되므로 같은 페이지 내 다른 카드도 재사용
 *  - storeId가 처음 등장하는 폴더(가장 작은 folderId 우선)를 반환
 */
export function useBookmarkedFolderForStore(storeId: number) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: folders = [] } = useBookmarkFoldersQuery();

  const queries = useQueries({
    queries: folders.map((folder) => ({
      queryKey: ['bookmarkFolder', folder.folderId, 'bookmarks'] as const,
      queryFn: () => getBookmarksInFolder(folder.folderId),
      enabled: !!accessToken,
    })),
  });

  for (let i = 0; i < folders.length; i += 1) {
    const folder = folders[i];
    const bookmarks = queries[i]?.data ?? [];
    const bookmark = bookmarks.find((b) => b.storeId === storeId);
    if (bookmark) {
      return {
        id: folder.folderId,
        name: folder.folderName,
        color: folder.color,
        type: folder.folderType,
        bookmarkId: bookmark.bookmarkId,
      };
    }
  }
  return null;
}
