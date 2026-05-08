// 이 triple-slash 지시어는 TypeScript에게 @types/kakao__maps 패키지의 타입을 먼저 로드하도록 알려줍니다.
// 이를 통해 아래의 선언이 기존 타입을 덮어쓰는 대신 '확장(augmentation)'하도록 보장합니다.
/// <reference types="@types/kakao__maps" />

declare namespace kakao.maps {
  // 1. @types/kakao__maps 패키지에 누락된 'clusterer' 라이브러리의 MarkerClusterer 클래스를 정의합니다.
  // 이 클래스는 기본 타입에 포함되어 있지 않으므로 새로 정의해야 합니다.
  export class MarkerClusterer {
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

  // 2. 기존 Marker 인터페이스를 확장하여 @types/kakao__maps에 누락된 함수들을 추가합니다.
  // `Size`, `Point`, `MarkerImage` 등은 기본 타입에 이미 존재하므로 재정의하지 않습니다.
  // 재정의할 경우 타입 충돌로 인해 기존 타입 전체가 무시될 수 있습니다.
  export interface Marker {
    setZIndex(zIndex: number): void;
    setMap(map: kakao.maps.Map | null): void;
    setImage(image: kakao.maps.MarkerImage): void;
  }

  // 3. 기존 Map 인터페이스를 확장하여 누락된 panTo 함수를 추가합니다.
  export interface Map {
    panTo(latlng: kakao.maps.LatLng): void;
  }
}