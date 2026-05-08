declare namespace kakao.maps {
  interface Marker {
    setZIndex(zIndex: number): void;
  }

  interface Map {
    panTo(latlng: LatLng): void;
  }
}