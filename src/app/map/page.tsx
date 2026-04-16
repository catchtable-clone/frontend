'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import { mockStores } from '@/lib/mockData';

function MapContent() {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<
    { store: (typeof mockStores)[0]; marker: kakao.maps.Marker; infoWindow: kakao.maps.InfoWindow }[]
  >([]);
  const openInfoWindowRef = useRef<kakao.maps.InfoWindow | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const searchParams = useSearchParams();

  const targetLat = searchParams.get('lat');
  const targetLng = searchParams.get('lng');
  const targetStoreId = searchParams.get('storeId');

  const initMap = useCallback(() => {
    if (!mapRef.current) return;

    kakao.maps.load(() => {
      const centerLat = targetLat ? parseFloat(targetLat) : 37.4979;
      const centerLng = targetLng ? parseFloat(targetLng) : 127.0276;
      const zoomLevel = targetStoreId ? 3 : 7;

      const map = new kakao.maps.Map(mapRef.current!, {
        center: new kakao.maps.LatLng(centerLat, centerLng),
        level: zoomLevel,
      });
      mapInstanceRef.current = map;
      markersRef.current = [];

      mockStores.forEach((store) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maps = kakao.maps as any;
        const markerImage = store.isClosed
          ? new maps.MarkerImage(
              'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
              new maps.Size(24, 35),
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

        const infoWindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:10px 14px;font-size:13px;line-height:1.6;white-space:nowrap;">
            ${closedBadge}<strong>${store.name}</strong><br/>
            <span style="color:#888;">${store.category} · ${store.address}</span><br/>
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
    });
  }, [targetLat, targetLng, targetStoreId]);

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

      <main className="flex-1">
        <div ref={mapRef} className="h-full min-h-0 w-full flex-1" />
      </main>

      <BottomNav />
    </>
  );
}

export default function MapPage() {
  return (
    <Suspense>
      <MapContent />
    </Suspense>
  );
}
