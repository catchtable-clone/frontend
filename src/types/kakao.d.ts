declare namespace kakao.maps {
  class Map {
    constructor(
      container: HTMLElement,
      options: { center: LatLng; level: number },
    );
    setCenter(position: LatLng): void;
    setLevel(level: number): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
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
  }

  class InfoWindow {
    constructor(options: { content: string; removable?: boolean });
    open(map: Map, marker: Marker): void;
    close(): void;
    setContent(content: string): void;
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
