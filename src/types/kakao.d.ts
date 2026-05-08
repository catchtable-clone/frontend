// 이 triple-slash 지시어는 TypeScript에게 @types/kakao__maps 패키지의 타입을 먼저 로드하도록 알려줍니다.
// 이를 통해 아래의 선언이 기존 타입을 덮어쓰는 대신 '확장(augmentation)'하도록 보장합니다.
/// <reference types="@types/kakao__maps" />

declare namespace kakao.maps {
  // --- Complete Type Definitions for map/page.tsx ---
  // The original @types/kakao__maps is incomplete. Declaring a namespace
  // with some classes was causing TypeScript to ignore the original definitions
  // entirely. This file now explicitly defines or extends all types used in
  // the map page to prevent type conflicts and build errors.

  // --- Classes ---
  // We must re-declare classes used with `new`
  export class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  export class Map {
    constructor(container: HTMLElement, options: any);
    panTo(latlng: LatLng): void;
    getBounds(): LatLngBounds;
    getCenter(): LatLng;
    getLevel(): number;
  }

  export class Marker {
    constructor(options: { position: LatLng; image?: MarkerImage; map?: Map });
  }

  export class MarkerImage {
    constructor(src: string, size: Size, options?: { offset?: Point });
  }

  export class Size {
    constructor(width: number, height: number);
  }

  export class Point {
    constructor(x: number, y: number);
  }

  export class MarkerClusterer {
    constructor(options: {
      map: Map;
      averageCenter?: boolean;
      minLevel?: number;
      gridSize?: number;
      minClusterSize?: number;
    });
    addMarkers(markers: Marker[]): void;
    clear(): void;
  }

  export class LatLngBounds {
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
  }

  // --- Interfaces (for extending class instance methods) ---
  export interface Marker {
    setZIndex(zIndex: number): void;
    setMap(map: Map | null): void;
    setImage(image: MarkerImage): void;
  }

  // --- Namespaces for other services ---
  export namespace event {
    function addListener(target: any, type: string, handler: (...args: any[]) => void): void;
  }
}