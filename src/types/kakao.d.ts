declare namespace kakao.maps {
  class Map {
    constructor(
      container: HTMLElement,
      options: { center: LatLng; level: number },
    );
  }

  class LatLng {
    constructor(lat: number, lng: number);
  }

  class Marker {
    constructor(options: { position: LatLng; map?: Map });
    setMap(map: Map | null): void;
  }

  class InfoWindow {
    constructor(options: { content: string; removable?: boolean });
    open(map: Map, marker: Marker): void;
    close(): void;
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
