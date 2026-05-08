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
  
  // 2. MarkerImage, Size, Point 클래스
  // 커스텀 마커 이미지를 사용할 때 필요한 타입들입니다.
  class Size {
    constructor(width: number, height: number);
    width: number;
    height: number;
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }

  class MarkerImage {
    constructor(
      src: string,
      size: kakao.maps.Size,
      options?: {
        alt?: string;
        coords?: string;
        offset?: kakao.maps.Point;
        shape?: string;
        spriteOrigin?: kakao.maps.Point;
        spriteSize?: kakao.maps.Size;
      },
    );
  }

  // 3. 기존 Marker 인터페이스를 확장하여 누락된 함수들을 추가합니다.
  interface Marker {
    setZIndex(zIndex: number): void;
    setMap(map: kakao.maps.Map | null): void;
    setImage(image: kakao.maps.MarkerImage): void;
  }

  // 4. 기존 Map 인터페이스를 확장하여 panTo 함수를 추가합니다.
  interface Map {
    panTo(latlng: kakao.maps.LatLng): void;
  }
}