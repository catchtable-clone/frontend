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
} from 'lucide-react';
import { mockStores, mockBookmarkFolders } from '@/lib/mockData';
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
  const [newFolderName, setNewFolderName] = useState('');

  const selectedFolder = folders.find((f) => f.id === selectedFolderId) || null;
  const sheetStores = selectedFolder
    ? mockStores.filter((s) => selectedFolder.storeIds.includes(s.id))
    : [];

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];
    openInfoWindowRef.current = null;
  }, []);

  const addMarkers = useCallback(
    (map: kakao.maps.Map) => {
      const storesToShow = mockStores;

      storesToShow.forEach((store) => {
        const isBookmarked = folders.some((f) =>
          f.storeIds.includes(store.id),
        );

        const markerImage = store.isClosed
          ? new kakao.maps.MarkerImage(
              'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
              new kakao.maps.Size(24, 35),
            )
          : undefined;

        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(store.lat, store.lng),
          map,
          ...(markerImage && { image: markerImage }),
          opacity: store.isClosed ? 0.5 : 1,
        });

        const closedBadge = store.isClosed
          ? '<span style="color:#ef4444;font-size:11px;font-weight:600;">휴업중</span><br/>'
          : '';

        const bookmarkBadge = isBookmarked
          ? '<span style="color:#f97316;font-size:11px;">&#9829; 즐겨찾기</span><br/>'
          : '';

        const infoWindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:10px 14px;font-size:13px;line-height:1.6;white-space:nowrap;">
            ${closedBadge}${bookmarkBadge}<strong>${store.name}</strong><br/>
            <span style="color:#888;">${store.category} · ${store.address}</span><br/>
            <span style="color:#f97316;font-size:12px;">★ ${store.rating}</span> <span style="color:#aaa;font-size:11px;">(${store.reviewCount})</span><br/>
            <a href="/stores/${store.id}" style="color:#f97316;font-size:12px;text-decoration:none;">상세보기 →</a>
          </div>`,
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
    [targetStoreId, folders],
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

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: BookmarkFolder = {
      id: Math.max(...folders.map((f) => f.id)) + 1,
      name: newFolderName.trim(),
      type: 'CUSTOM',
      storeIds: [],
    };
    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName('');
    setShowAddFolder(false);
    setSelectedFolderId(newFolder.id);
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
    const q = query.toLowerCase();
    const found = markersRef.current.find(
      ({ store }) =>
        store.name.toLowerCase().includes(q) ||
        store.category.toLowerCase().includes(q) ||
        store.address.toLowerCase().includes(q),
    );

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
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${
                      selectedFolderId === folder.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {folder.name} ({folder.storeIds.length})
                  </button>
                  {isEditing && folder.type !== 'DEFAULT' && (
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="absolute -right-1 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X size={10} />
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowAddFolder(false);
              setNewFolderName('');
            }}
          />
          <div className="relative mx-4 w-full max-w-[360px] rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              새 폴더 만들기
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="폴더 이름을 입력하세요"
              className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setShowAddFolder(false);
                  setNewFolderName('');
                }}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAddFolder}
                disabled={!newFolderName.trim()}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white ${
                  newFolderName.trim()
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-gray-300'
                }`}
              >
                만들기
              </button>
            </div>
          </div>
        </div>
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
