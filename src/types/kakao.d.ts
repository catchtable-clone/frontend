/// <reference types="@types/kakao__maps" />

//vercel 배포 오류 해결
declare namespace kakao.maps {

  export function load(callback: () => void): void;

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
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
  }

  export class MarkerImage {
    constructor(src: string, size: Size, options?: { offset?: Point });
  }

  export class Marker {
    constructor(options: { position: LatLng; image?: MarkerImage; map?: Map });
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

  export interface Marker {
    setZIndex(zIndex: number): void;
    setMap(map: Map | null): void;
    setImage(image: MarkerImage): void;
  }

  export namespace event {
    function addListener(target: any, type: string, handler: (...args: any[]) => void): void;
  }
}