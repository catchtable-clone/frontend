declare global {
  namespace kakao.maps {
    interface Marker {
      setZIndex(zIndex: number): void;
    }
  }
}
export {};