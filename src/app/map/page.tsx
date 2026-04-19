'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
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
import { mockStores, mockBookmarkFolders } from '@/lib/mockData';
import { filterStores } from '@/lib/utils';
import FolderFormModal from '@/components/common/FolderFormModal';
import type { BookmarkFolder } from '@/types/store';

interface MarkerEntry {
  store: (typeof mockStores)[0];
  marker: kakao.maps.Marker;
  infoWindow: kakao.maps.InfoWindow;
}

function MapContent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<MarkerEntry[]>([]);
  const openInfoWindowRef = useRef<kakao.maps.InfoWindow | null>(null);
  const foldersRef = useRef<BookmarkFolder[]>(mockBookmarkFolders);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const targetLat = searchParams.get('lat');
  const targetLng = searchParams.get('lng');
  const targetStoreId = searchParams.get('storeId');

  // 바텀시트 상태
  const [showSheet, setShowSheet] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number>(mockBookmarkFolders[0]?.id ?? 1);
  const [isEditing, setIsEditing] = useState(false);
  const [folders, setFolders] = useState<BookmarkFolder[]>(mockBookmarkFolders);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [editFolder, setEditFolder] = useState<BookmarkFolder | null>(null);

  const selectedFolder = folders.find((f) => f.id === selectedFolderId) || null;
  const sheetStores = selectedFolder
    ? mockStores.filter((s) => selectedFolder.storeIds.includes(s.id))
    : [];

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];
    openInfoWindowRef.current = null;
  }, []);

  // foldersRef를 항상 최신 상태로 유지
  useEffect(() => {
    foldersRef.current = folders;
  }, [folders]);

  const getStoreFolder = useCallback(
    (storeId: number, folderList: BookmarkFolder[]) => {
      return folderList.find((f) => f.storeIds.includes(storeId)) || null;
    },
    [],
  );

  const createColoredMarkerImage = useCallback((color: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>`;
    return new kakao.maps.MarkerImage(
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      new kakao.maps.Size(28, 40),
    );
  }, []);

  const buildInfoContent = useCallback(
    (store: (typeof mockStores)[0]) => {
      const closedBadge = store.isClosed
        ? '<span style="color:#ef4444;font-size:11px;font-weight:600;">휴업중</span><br/>'
        : '';
      return `<div style="padding:10px 14px;font-size:13px;line-height:1.6;white-space:nowrap;">
        ${closedBadge}<strong>${store.name}</strong><br/>
        <span style="color:#888;">${store.category} · ${store.address}</span><br/>
        <span style="color:#f97316;font-size:12px;">★ ${store.rating}</span> <span style="color:#aaa;font-size:11px;">(${store.reviewCount})</span><br/>
        <a href="/stores/${store.id}" style="color:#f97316;font-size:12px;text-decoration:none;">상세보기 →</a>
      </div>`;
    },
    [],
  );

  // folders 변경 시 마커 색상 즉시 업데이트
  useEffect(() => {
    markersRef.current.forEach(({ store, marker }) => {
      if (store.isClosed) return;
      const folder = getStoreFolder(store.id, folders);
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
  }, [folders, getStoreFolder, createColoredMarkerImage]);

  const addMarkers = useCallback(
    (map: kakao.maps.Map) => {
      mockStores.forEach((store) => {
        const folder = getStoreFolder(store.id, foldersRef.current);
        const markerImage = store.isClosed
          ? new kakao.maps.MarkerImage(
              'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
              new kakao.maps.Size(24, 35),
            )
          : folder
            ? createColoredMarkerImage(folder.color)
            : undefined;

        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(store.lat, store.lng),
          map,
          ...(markerImage && { image: markerImage }),
          opacity: store.isClosed ? 0.5 : 1,
        });

        const infoWindow = new kakao.maps.InfoWindow({
          content: buildInfoContent(store),
        });

        markersRef.current.push({ store, marker, infoWindow });

        kakao.maps.event.addListener(marker, 'click', () => {
          if (openInfoWindowRef.current) openInfoWindowRef.current.close();
          infoWindow.open(map, marker);
          openInfoWindowRef.current = infoWindow;
        });

        if (targetStoreId && store.id === Number(targetStoreId)) {
          infoWindow.open(map, marker);
          openInfoWindowRef.current = infoWindow;
        }
      });
    },
    [targetStoreId, buildInfoContent, createColoredMarkerImage, getStoreFolder],
  );


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
        clearMarkers();
        addMarkers(map);
      } else {
        const map = new kakao.maps.Map(mapRef.current!, {
          center,
          level: zoomLevel,
        });
        mapInstanceRef.current = map;
        addMarkers(map);
      }
    });
  }, [targetLat, targetLng, targetStoreId, clearMarkers, addMarkers]);

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

  const handleFolderSelect = (folderId: number) => {
    setSelectedFolderId(folderId);
  };

  const handleOpenSheet = () => {
    setShowSheet(true);
    setSelectedFolderId(folders[0]?.id ?? 1);
    setIsEditing(false);
  };

  const handleRemoveStore = (storeId: number) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === selectedFolderId
          ? { ...f, storeIds: f.storeIds.filter((id) => id !== storeId) }
          : f,
      ),
    );
  };

  const handleDeleteFolder = (folderId: number) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (selectedFolderId === folderId) {
      const remaining = folders.filter((f) => f.id !== folderId);
      setSelectedFolderId(remaining[0]?.id ?? 1);
    }
  };

  const handleAddFolder = (name: string, color: string) => {
    const newFolder: BookmarkFolder = {
      id: Math.max(...folders.map((f) => f.id)) + 1,
      name,
      type: 'CUSTOM',
      color,
      storeIds: [],
    };
    setFolders((prev) => [...prev, newFolder]);
    setShowAddFolder(false);
    setSelectedFolderId(newFolder.id);
  };

  const handleEditFolder = (name: string, color: string) => {
    if (!editFolder) return;
    setFolders((prev) =>
      prev.map((f) =>
        f.id === editFolder.id ? { ...f, name, color } : f,
      ),
    );
    setEditFolder(null);
  };

  const handleStoreClick = (storeId: number) => {
    if (isEditing) return;
    const store = mockStores.find((s) => s.id === storeId);
    if (!store || !mapInstanceRef.current) return;

    setShowSheet(false);
    const map = mapInstanceRef.current;
    const position = new kakao.maps.LatLng(store.lat, store.lng);
    map.setCenter(position);
    map.setLevel(3);

    const entry = markersRef.current.find((m) => m.store.id === storeId);
    if (entry) {
      if (openInfoWindowRef.current) openInfoWindowRef.current.close();
      entry.infoWindow.open(map, entry.marker);
      openInfoWindowRef.current = entry.infoWindow;
    }
  };

  const handleMapSearch = (query: string) => {
    const matched = filterStores(
      markersRef.current.map((m) => m.store),
      query,
    );
    const found = matched.length > 0
      ? markersRef.current.find((m) => m.store.id === matched[0].id)
      : undefined;

    if (found && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      const position = new kakao.maps.LatLng(found.store.lat, found.store.lng);
      map.setCenter(position);
      map.setLevel(3);

      if (openInfoWindowRef.current) openInfoWindowRef.current.close();
      found.infoWindow.open(map, found.marker);
      openInfoWindowRef.current = found.infoWindow;
    }
  };

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
      />

      <Header showSearch showBack onSearch={handleMapSearch} />

      <main className="relative flex-1">
        <div ref={mapRef} className="h-full min-h-0 w-full flex-1" />

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
              {folders.map((folder) => (
                <div key={folder.id} className="relative flex flex-shrink-0 py-1">
                  <button
                    onClick={() => handleFolderSelect(folder.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                      selectedFolderId === folder.id
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                    style={
                      selectedFolderId === folder.id
                        ? { backgroundColor: folder.color }
                        : undefined
                    }
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: folder.color }}
                    />
                    {folder.name} ({folder.storeIds.length})
                  </button>
                  {isEditing && (
                    <button
                      onClick={() => setEditFolder(folder)}
                      className="absolute -right-1 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-600 text-white"
                    >
                      <Pencil size={8} />
                    </button>
                  )}
                </div>
              ))}
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
              {sheetStores.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Heart size={32} className="text-gray-300" />
                  <p className="text-sm text-gray-400">
                    이 폴더에 저장된 매장이 없습니다
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {sheetStores.map((store) => (
                    <div
                      key={store.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                    >
                      <button
                        onClick={() => handleStoreClick(store.id)}
                        className="flex flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <MapPin size={18} className="text-gray-400" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-900">
                              {store.name}
                            </span>
                            {store.isClosed && (
                              <span className="rounded bg-red-50 px-1 py-0.5 text-[10px] text-red-500">
                                휴업중
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                            <span>{store.category}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Star
                                size={10}
                                className="fill-orange-400 text-orange-400"
                              />
                              {store.rating}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            {store.address}
                          </p>
                        </div>
                      </button>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveStore(store.id)}
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
          folder={editFolder}
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
