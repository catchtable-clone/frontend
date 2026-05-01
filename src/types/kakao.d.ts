declare namespace kakao.maps {
  class Map {
    constructor(
      container: HTMLElement,
      options: { center: LatLng; level: number },
    );
    setCenter(position: LatLng): void;
    setLevel(level: number): void;
    getBounds(): LatLngBounds;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class LatLngBounds {
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class MarkerImage {
    constructor(src: string, size: Size);
  }

  class Marker {
    constructor(options: {
      position: LatLng;
      map?: Map;
      image?: MarkerImage;
      opacity?: number;
    });
    setMap(map: Map | null): void;
    setImage(image: MarkerImage): void;
  }

  class InfoWindow {
    constructor(options: { content: string; removable?: boolean });
    open(map: Map, marker: Marker): void;
    close(): void;
    setContent(content: string): void;
  }

  /**
   * 카카오맵 내장 마커 클러스터러.
   * SDK 로드 시 ?libraries=clusterer 가 필요하다.
   *  - minLevel: 클러스터링이 활성화되는 최소 줌 레벨.
   *    카카오맵 레벨은 작을수록 가까이(1)·클수록 멀리(14).
   *    minLevel=N 이면 줌 레벨 ≥ N 일 때만 묶고, 그보다 줌인하면 개별 마커로 풀린다.
   */
  class MarkerClusterer {
    constructor(options: {
      map: Map;
      markers?: Marker[];
      averageCenter?: boolean;
      minLevel?: number;
      gridSize?: number;
      disableClickZoom?: boolean;
      minClusterSize?: number;
    });
    addMarkers(markers: Marker[], alsoMap?: boolean): void;
    removeMarker(marker: Marker, alsoMap?: boolean): void;
    clear(): void;
    setMap(map: Map | null): void;
  }

  namespace event {
    function addListener(
      target: Marker | Map,
      type: string,
      callback: () => void,
    ): void;
  }

  function load(callback: () => void): void;
}
