// 이 triple-slash 지시어는 TypeScript에게 @types/kakao__maps 패키지의 타입을 먼저 로드하도록 알려줍니다.
// 이를 통해 아래의 선언이 기존 타입을 덮어쓰는 대신 '확장(augmentation)'하도록 보장합니다.
/// <reference types="@types/kakao__maps" />

declare namespace kakao.maps {
  // --- 기존 타입과 병합하기 위해 수동으로 추가하는 타입 정의 ---

  // 1. MarkerClusterer 클래스
  // @types/kakao__maps 패키지에 누락된 'clusterer' 라이브러리의 타입입니다.
  // 빌드 오류를 해결하기 위해 사용하는 기능(생성자, addMarkers, clear)을 직접 정의합니다.
  class MarkerClusterer {
    constructor(options: {
      map: kakao.maps.Map;
      averageCenter?: boolean;
      minLevel?: number;
      gridSize?: number;
      minClusterSize?: number;
    });
    addMarkers(markers: kakao.maps.Marker[]): void;
    clear(): void;
  }

  // 2. 기존 Marker 인터페이스를 확장하여 setZIndex 함수를 추가합니다.
  interface Marker {
    setZIndex(zIndex: number): void;
    setMap(map: kakao.maps.Map | null): void;
  }

  // 3. 기존 Map 인터페이스를 확장하여 panTo 함수를 추가합니다.
  interface Map {
    panTo(latlng: kakao.maps.LatLng): void;
  }
}