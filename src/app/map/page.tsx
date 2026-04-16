'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import { mockStores } from '@/lib/mockData';

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    if (!sdkLoaded || !mapRef.current) return;

    kakao.maps.load(() => {
      const map = new kakao.maps.Map(mapRef.current!, {
        center: new kakao.maps.LatLng(37.4979, 127.0276),
        level: 7,
      });

      let openInfoWindow: kakao.maps.InfoWindow | null = null;

      mockStores.forEach((store) => {
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(store.lat, store.lng),
          map,
        });

        const infoWindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:10px 14px;font-size:13px;line-height:1.6;white-space:nowrap;">
            <strong>${store.name}</strong><br/>
            <span style="color:#888;">${store.category} · ${store.address}</span><br/>
            <a href="/stores/${store.id}" style="color:#f97316;font-size:12px;text-decoration:none;">상세보기 →</a>
          </div>`,
        });

        kakao.maps.event.addListener(marker, 'click', () => {
          if (openInfoWindow) openInfoWindow.close();
          infoWindow.open(map, marker);
          openInfoWindow = infoWindow;
        });
      });
    });
  }, [sdkLoaded]);

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setSdkLoaded(true)}
      />

      <Header title="지도" showBack />

      <main className="flex-1">
        <div ref={mapRef} className="h-full min-h-0 w-full flex-1" />
      </main>

      <BottomNav />
    </>
  );
}
