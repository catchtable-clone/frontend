'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  Heart,
  Star,
  X,
  Trash2,
  Plus,
  MapPin,
  Pencil,
} from 'lucide-react';
import FolderFormModal from '@/components/common/FolderFormModal';
import { filterStores } from '@/lib/utils';
import { toCategoryLabel } from '@/lib/storeEnum';
import { getStoresInBounds, type StoreBounds } from '@/lib/storeApi';
import { useQuery, useQueries } from '@tanstack/react-query';
import {
  useBookmarkFoldersQuery,
  useCreateBookmarkFolderMutation,
  useUpdateBookmarkFolderMutation,
  useDeleteBookmarkFolderMutation,
  useDeleteBookmarkMutation,
} from '@/lib/bookmarkQuery';
import { getBookmarksInFolder, type BookmarkResponse } from '@/lib/bookmarkApi';
import { useAuthStore } from '@/stores/authStore';
import type { StoreSummary } from '@/types/store';

interface MarkerEntry {
  store: StoreSummary;
  marker: kakao.maps.Marker;
}

function MapContent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<MarkerEntry[]>([]);
  // 줌 레벨이 일정 이상일 때 가까운 마커들을 자동으로 묶어주는 카카오맵 내장 클러스터러
  const clustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  /**
   * 사용자가 매장 위치로 명시적으로 점프했을 때(즐겨찾기 시트 클릭 등)
   * 다음 idle에서는 버튼 없이 즉시 재검색하도록 신호하는 플래그.
   */
  const forceSearchOnNextIdleRef = useRef(false);

  /**
   * 화면에 카드로 표시할 매장 정보 — 마커 클릭 / 즐겨찾기 점프 둘 다 같은 모델로 처리.
   * InfoWindow와 달리 다른 마커/클러스터에 가려지지 않는다.
   */
  interface FocusedStore {
    storeId: number;
    storeName: string;
    category: string;
    address: string;
  }
  const [focusedStore, setFocusedStore] = useState<FocusedStore | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const targetLat = searchParams.get('lat');
  const targetLng = searchParams.get('lng');
  const targetStoreId = searchParams.get('storeId');

  // ===== 데이터 — 매장 + 북마크 폴더 + 폴더별 북마크 =====
  const { accessToken } = useAuthStore();

  /**
   * 검색에 사용된 영역 (= 사용자가 명시적으로 검색을 트리거한 시점의 bounds).
   * 자동 재검색 대신 "이 지역에서 다시 찾기" 버튼식 방식.
   * (실제 서비스 — 캐치테이블·네이버·구글맵 — 모두 이 방향으로 수렴)
   */
  const [searchedBounds, setSearchedBounds] = useState<StoreBounds | null>(null);

  /**
   * 지도가 현재 보고 있는 영역 — idle 이벤트마다 갱신되지만 즉시 검색하지는 않는다.
   * `searchedBounds`와 비교해서 충분히 차이나면 재검색 버튼을 노출한다.
   */
  const [pendingBounds, setPendingBounds] = useState<StoreBounds | null>(null);

  const { data: stores = [] } = useQuery({
    queryKey: ['mapStores', searchedBounds] as const,
    queryFn: () => getStoresInBounds(searchedBounds as StoreBounds),
    enabled: searchedBounds !== null,
    staleTime: 60 * 1000, // 사용자가 같은 영역을 다시 보면 1분 동안 캐시 재사용
  });

  /**
   * 사용자가 지도를 충분히 움직였을 때만 재검색 버튼을 띄우기 위한 판정.
   * - 영역의 중심 거리가 일정 이상 멀어졌거나
   * - 영역 크기가 크게 달라졌으면 (줌 변경)
   */
  const shouldShowRefetch = (() => {
    if (!pendingBounds) return false;
    if (!searchedBounds) return true;
    const latDelta = Math.abs(pendingBounds.centerLat - searchedBounds.centerLat);
    const lngDelta = Math.abs(pendingBounds.centerLng - searchedBounds.centerLng);
    const oldSpan = (searchedBounds.maxLat - searchedBounds.minLat)
      + (searchedBounds.maxLng - searchedBounds.minLng);
    const newSpan = (pendingBounds.maxLat - pendingBounds.minLat)
      + (pendingBounds.maxLng - pendingBounds.minLng);
    const spanRatio = Math.max(oldSpan, newSpan) / Math.max(Math.min(oldSpan, newSpan), 1e-9);
    // 중심이 영역 폭의 30% 이상 이동했거나, 줌이 1.4배 이상 바뀐 경우
    return latDelta > (searchedBounds.maxLat - searchedBounds.minLat) * 0.3
        || lngDelta > (searchedBounds.maxLng - searchedBounds.minLng) * 0.3
        || spanRatio > 1.4;
  })();

  const { data: folders = [] } = useBookmarkFoldersQuery();

  // 폴더별 북마크 목록 — 마커 색상·시트 표시 둘 다에 사용
  const folderBookmarkQueries = useQueries({
    queries: folders.map((f) => ({
      queryKey: ['bookmarkFolder', f.folderId, 'bookmarks'] as const,
      queryFn: () => getBookmarksInFolder(f.folderId),
      enabled: !!accessToken,
    })),
  });

  // storeId → folder 매핑 (가장 작은 folderId가 우선)
  const storeIdToFolder = useMemo(() => {
    const map = new Map<number, (typeof folders)[number]>();
    folders.forEach((folder, idx) => {
      const bookmarks = folderBookmarkQueries[idx]?.data ?? [];
      bookmarks.forEach((b) => {
        if (!map.has(b.storeId)) map.set(b.storeId, folder);
      });
    });
    return map;
  }, [folders, folderBookmarkQueries]);

  // 바텀시트 상태
  const [showSheet, setShowSheet] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [editFolder, setEditFolder] = useState<
    { id: number; name: string; color: string; type?: 'DEFAULT' | 'CUSTOM' | 'SLACK' } | null
  >(null);

  const { mutate: createFolder } = useCreateBookmarkFolderMutation();
  const { mutate: updateFolder } = useUpdateBookmarkFolderMutation();
  const { mutate: deleteFolder } = useDeleteBookmarkFolderMutation();
  const { mutate: removeBookmark } = useDeleteBookmarkMutation();

  // 시트에 표시할 매장(=선택 폴더의 북마크)
  const sheetBookmarks: BookmarkResponse[] = useMemo(() => {
    if (selectedFolderId == null) return [];
    const idx = folders.findIndex((f) => f.folderId === selectedFolderId);
    if (idx < 0) return [];
    return folderBookmarkQueries[idx]?.data ?? [];
  }, [selectedFolderId, folders, folderBookmarkQueries]);

  // 폴더 목록이 처음 도착하면 첫 폴더를 선택
  useEffect(() => {
    if (selectedFolderId == null && folders.length > 0) {
      setSelectedFolderId(folders[0].folderId);
    }
  }, [folders, selectedFolderId]);

  // ===== 마커 관리 =====
  /**
   * 마커를 모두 제거. 클러스터러가 있으면 클러스터에서 일괄 제거하고,
   * 없으면 개별 마커를 setMap(null)로 떼어낸다.
   */
  const clearMarkers = useCallback(() => {
    if (clustererRef.current) {
      clustererRef.current.clear();
    } else {
      markersRef.current.forEach(({ marker }) => marker.setMap(null));
    }
    markersRef.current = [];
  }, []);

  const markerImageCache = useRef<Map<string, kakao.maps.MarkerImage>>(new Map());

  const createColoredMarkerImage = useCallback((color: string) => {
    const cached = markerImageCache.current.get(color);
    if (cached) return cached;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`;
    const image = new kakao.maps.MarkerImage(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      new kakao.maps.Size(28, 40),
    );
    markerImageCache.current.set(color, image);
    return image;
  }, []);

  // 폴더/북마크 변경 시 마커 색상 즉시 업데이트
  useEffect(() => {
    markersRef.current.forEach(({ store, marker }) => {
      const folder = storeIdToFolder.get(store.storeId);
      if (folder) {
        marker.setImage(createColoredMarkerImage(folder.color));
      } else {
        marker.setImage(
          new kakao.maps.MarkerImage(
            'https://t1.daumcdn.net/mapjsapi/images/marker.png',
            new kakao.maps.Size(29, 42),
          ),
        );
      }
    });
  }, [storeIdToFolder, createColoredMarkerImage]);

  const addMarkers = useCallback(
    (map: kakao.maps.Map) => {
      const newMarkers: kakao.maps.Marker[] = [];

      stores.forEach((store) => {
        const folder = storeIdToFolder.get(store.storeId);
        const markerImage = folder
          ? createColoredMarkerImage(folder.color)
          : undefined;

        // 클러스터러가 마커의 표시(map)를 관리하므로 여기서는 map을 넘기지 않는다.
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(store.latitude, store.longitude),
          ...(markerImage && { image: markerImage }),
        });

        markersRef.current.push({ store, marker });
        newMarkers.push(marker);

        // 마커 클릭 → 클릭한 매장을 지도 중앙으로 이동 + React 카드로 매장 정보 표시
        kakao.maps.event.addListener(marker, 'click', () => {
          // panTo는 카카오맵 SDK에 존재하지만 일부 타입 정의에 누락됨
          (map as unknown as { panTo: (latlng: kakao.maps.LatLng) => void }).panTo(
            new kakao.maps.LatLng(store.latitude, store.longitude),
          );
          setFocusedStore({
            storeId: store.storeId,
            storeName: store.storeName,
            category: store.category,
            address: store.address,
          });
        });

        if (targetStoreId && store.storeId === Number(targetStoreId)) {
          setFocusedStore({
            storeId: store.storeId,
            storeName: store.storeName,
            category: store.category,
            address: store.address,
          });
        }
      });

      if (clustererRef.current) {
        clustererRef.current.addMarkers(newMarkers);
      } else {
        // 안전망 — 클러스터러가 아직 준비되지 않은 경우 개별 표시
        newMarkers.forEach((m) => m.setMap(map));
      }
    },
    [stores, storeIdToFolder, targetStoreId, createColoredMarkerImage],
  );

  /**
   * 카카오맵 LatLngBounds 객체를 우리 쿼리 파라미터 모양으로 변환.
   */
  const readBoundsFromMap = useCallback((map: kakao.maps.Map): StoreBounds => {
    const b = map.getBounds();
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    const minLat = sw.getLat();
    const maxLat = ne.getLat();
    const minLng = sw.getLng();
    const maxLng = ne.getLng();
    return {
      minLat,
      maxLat,
      minLng,
      maxLng,
      // 영역의 기하 중심을 직접 계산해 백엔드의 거리순 정렬 기준점으로 사용
      centerLat: (minLat + maxLat) / 2,
      centerLng: (minLng + maxLng) / 2,
    };
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current) return;

    kakao.maps.load(() => {
      const centerLat = targetLat ? parseFloat(targetLat) : 37.4979;
      const centerLng = targetLng ? parseFloat(targetLng) : 127.0276;
      const zoomLevel = targetStoreId ? 3 : 7;
      const center = new kakao.maps.LatLng(centerLat, centerLng);

      if (mapInstanceRef.current) {
        const map = mapInstanceRef.current;
        map.setCenter(center);
        map.setLevel(zoomLevel);
        // targetLat/Lng/storeId가 바뀐 경우는 사용자 명시적 의도이므로 즉시 재검색
        const newBounds = readBoundsFromMap(map);
        setSearchedBounds(newBounds);
        setPendingBounds(newBounds);
      } else {
        const map = new kakao.maps.Map(mapRef.current!, {
          center,
          level: zoomLevel,
        });
        mapInstanceRef.current = map;

        // 클러스터러 — 줌 2 이상에서만 묶고 줌 1(가장 가까이)에선 풀어진다.
        //  - minLevel: 2 → 줌 1로 가까이 가면 모든 마커가 개별 표시
        //  - minClusterSize: 2 → 2개 가까이 있으면 묶음
        //  - gridSize: 80 → 시각적 여백 확보
        clustererRef.current = new kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 2,
          gridSize: 80,
          minClusterSize: 2,
        });

        // 첫 진입 시 한 번만 자동 검색
        const initialBounds = readBoundsFromMap(map);
        setSearchedBounds(initialBounds);
        setPendingBounds(initialBounds);

        // 지도 이동·확대 후 (idle) — 기본은 자동 재검색하지 않고 pendingBounds만 갱신.
        // 단, 매장 위치 점프 같은 명시적 트리거가 있었으면 그 한 번만 즉시 재검색.
        kakao.maps.event.addListener(map, 'idle', () => {
          const newBounds = readBoundsFromMap(map);
          setPendingBounds(newBounds);
          if (forceSearchOnNextIdleRef.current) {
            forceSearchOnNextIdleRef.current = false;
            setSearchedBounds(newBounds);
          }
        });

        // 빈 지도(매장 마커가 아닌 곳) 클릭 → 카드 닫기.
        // 마커 클릭은 카드를 갱신하므로, click 이벤트는 마커 외부에만 도달한다.
        kakao.maps.event.addListener(map, 'click', () => {
          setFocusedStore(null);
        });
      }
    });
  }, [targetLat, targetLng, targetStoreId, readBoundsFromMap]);

  useEffect(() => {
    if (sdkLoaded) {
      initMap();
      return;
    }
    if (typeof window !== 'undefined' && window.kakao?.maps) {
      setSdkLoaded(true);
      initMap();
    }
  }, [sdkLoaded, initMap]);

  /**
   * stores 응답이 갱신될 때마다 마커를 재생성.
   * (이전 markers는 모두 제거하고 다시 그린다 — 영역이 바뀌면 매장 집합도 통째로 바뀌므로 단순 교체가 가장 안전)
   */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    clearMarkers();
    addMarkers(map);
  }, [stores, clearMarkers, addMarkers]);

  // ===== 핸들러 =====

  const handleOpenSheet = () => {
    setShowSheet(true);
    setSelectedFolderId(folders[0]?.folderId ?? null);
    setIsEditing(false);
  };

  const handleRemoveStore = (bookmarkId: number) => {
    removeBookmark(bookmarkId);
    // 에러 토스트는 axios 인터셉터가 처리
  };

  const handleDeleteFolder = (folderId: number) => {
    deleteFolder(folderId, {
      onSuccess: () => {
        if (selectedFolderId === folderId) {
          const remaining = folders.filter((f) => f.folderId !== folderId);
          setSelectedFolderId(remaining[0]?.folderId ?? null);
        }
      },
    });
  };

  const handleAddFolder = (name: string, color: string) => {
    createFolder(
      { folderName: name, color },
      {
        onSuccess: (res) => setSelectedFolderId(res.folderId),
      },
    );
    setShowAddFolder(false);
  };

  const handleEditFolder = (name: string, color: string) => {
    if (!editFolder) return;
    updateFolder({ folderId: editFolder.id, folderName: name, color });
    setEditFolder(null);
  };

  /**
   * 시트의 북마크 매장을 클릭했을 때:
   *  - 북마크 응답에 좌표가 포함되어 있으므로 stores 배열에 없어도 이동 가능
   *  - 해당 매장 마커가 지도에 있으면 InfoWindow를 열고, 없으면 중심 이동만 수행
   */
  const handleStoreClick = (bookmark: BookmarkResponse) => {
    if (isEditing) return;
    if (!mapInstanceRef.current) return;

    setShowSheet(false);
    const map = mapInstanceRef.current;
    const position = new kakao.maps.LatLng(bookmark.latitude, bookmark.longitude);
    // 사용자가 명시적으로 점프한 경우이므로 다음 idle에서 자동 재검색
    forceSearchOnNextIdleRef.current = true;
    map.setCenter(position);
    map.setLevel(1); // 가장 가까이 줌인 — 이 줌에선 클러스터링이 자연스럽게 풀어짐

    // 매장 정보를 React 카드로 표시 (마커 클릭과 동일한 카드)
    setFocusedStore({
      storeId: bookmark.storeId,
      storeName: bookmark.storeName,
      category: bookmark.category,
      address: bookmark.address,
    });
  };

  const handleMapSearch = (query: string) => {
    const matched = filterStores(
      markersRef.current.map((m) => m.store),
      query,
    );
    const found = matched.length > 0
      ? markersRef.current.find((m) => m.store.storeId === matched[0].storeId)
      : undefined;

    if (found && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      const { store } = found;
      const position = new kakao.maps.LatLng(store.latitude, store.longitude);
      map.setCenter(position);
      map.setLevel(3);
      // 마커 클릭과 일관성 — 매장 정보 카드 표시
      setFocusedStore({
        storeId: store.storeId,
        storeName: store.storeName,
        category: store.category,
        address: store.address,
      });
    }
  };

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=clusterer`}
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
      />

      <Header showSearch showBack onSearch={handleMapSearch} />

      <main className="relative flex-1">
        <div ref={mapRef} className="h-full min-h-0 w-full flex-1" />

        {/* 이 지역 다시 찾기 — 사용자가 지도를 충분히 움직였을 때만 노출 */}
        {shouldShowRefetch && pendingBounds && (
          <button
            onClick={() => setSearchedBounds(pendingBounds)}
            className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-orange-600"
          >
            이 지역에서 다시 찾기
          </button>
        )}

        {/* 포커스된 매장 카드 — 마커/즐겨찾기 클릭 시 갱신, 클러스터에 가려지지 않음 */}
        {focusedStore && (
          <div className="absolute bottom-20 left-4 right-4 z-20 rounded-xl bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-gray-400">
                  {toCategoryLabel(focusedStore.category)}
                </p>
                <h3 className="text-base font-semibold text-gray-900">
                  {focusedStore.storeName}
                </h3>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {focusedStore.address}
                </p>
                <button
                  onClick={() => router.push(`/stores/${focusedStore.storeId}`)}
                  className="mt-2 text-xs font-medium text-orange-500 hover:text-orange-600"
                >
                  상세보기 →
                </button>
              </div>
              <button
                onClick={() => setFocusedStore(null)}
                className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* 즐겨찾기 버튼 */}
        <button
          onClick={handleOpenSheet}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-lg hover:bg-gray-50"
        >
          <Heart size={16} className="fill-orange-400 text-orange-400" />
          즐겨찾기
        </button>
      </main>

      <BottomNav />

      {/* 즐겨찾기 바텀시트 */}
      {showSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowSheet(false);
              setIsEditing(false);
            }}
          />
          <div className="relative flex w-full max-w-[480px] flex-col rounded-t-2xl bg-white" style={{ height: '50vh' }}>
            {/* 핸들바 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between px-5 pb-2 pt-1">
              <h3 className="text-lg font-semibold text-gray-900">
                즐겨찾기
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    isEditing
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isEditing ? '완료' : '편집'}
                </button>
                <button
                  onClick={() => {
                    setShowSheet(false);
                    setIsEditing(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* 폴더 탭 */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 px-5 pb-3 pt-1">
              {folders.map((folder, idx) => {
                const count = folderBookmarkQueries[idx]?.data?.length ?? 0;
                const isSelected = selectedFolderId === folder.folderId;
                return (
                  <div key={folder.folderId} className="relative flex flex-shrink-0 py-1">
                    <button
                      onClick={() => setSelectedFolderId(folder.folderId)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                        isSelected ? 'text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                      style={isSelected ? { backgroundColor: folder.color } : undefined}
                    >
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      {folder.folderName} ({count})
                    </button>
                    {isEditing && folder.folderType !== 'DEFAULT' && (
                      <button
                        onClick={() =>
                          setEditFolder({
                            id: folder.folderId,
                            name: folder.folderName,
                            color: folder.color,
                            type: folder.folderType,
                          })
                        }
                        className="absolute -right-1 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-white"
                      >
                        <Pencil size={8} />
                      </button>
                    )}
                  </div>
                );
              })}
              {isEditing && (
                <div className="py-1">
                  <button
                    onClick={() => setShowAddFolder(true)}
                    className="flex flex-shrink-0 items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-200"
                  >
                    <Plus size={12} />
                    추가
                  </button>
                </div>
              )}
            </div>

            {/* 매장 리스트 */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {sheetBookmarks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Heart size={32} className="text-gray-300" />
                  <p className="text-sm text-gray-400">
                    {accessToken
                      ? '이 폴더에 저장된 매장이 없습니다'
                      : '로그인이 필요합니다'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {sheetBookmarks.map((b) => (
                    <div
                      key={b.bookmarkId}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                    >
                      <button
                        onClick={() => handleStoreClick(b)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 overflow-hidden">
                          {b.storeImage ? (
                            <img
                              src={b.storeImage}
                              alt={b.storeName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/images/ready_image.png';
                              }}
                            />
                          ) : (
                            <MapPin size={18} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-900">
                              {b.storeName}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                            <span>{toCategoryLabel(b.category)}</span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            {b.address}
                          </p>
                        </div>
                      </button>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveStore(b.bookmarkId)}
                          className="flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 폴더 추가 모달 */}
      {showAddFolder && (
        <FolderFormModal
          mode="create"
          onSubmit={handleAddFolder}
          onClose={() => setShowAddFolder(false)}
        />
      )}

      {/* 폴더 편집 모달 */}
      {editFolder && (
        <FolderFormModal
          mode="edit"
          folder={{
            id: editFolder.id,
            name: editFolder.name,
            color: editFolder.color,
            type: editFolder.type,
            storeIds: [],
          }}
          onSubmit={handleEditFolder}
          onDelete={() => {
            handleDeleteFolder(editFolder.id);
            setEditFolder(null);
          }}
          onClose={() => setEditFolder(null)}
        />
      )}
    </>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <MapContent />
    </Suspense>
  );
}
