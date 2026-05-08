// 이 triple-slash 지시어는 TypeScript에게 @types/kakao__maps 패키지의 타입을 먼저 로드하도록 알려줍니다.
// 이를 통해 아래의 선언이 기존 타입을 덮어쓰는 대신 '확장(augmentation)'하도록 보장합니다.
/// <reference types="@types/kakao__maps" />

declare namespace kakao.maps {
  // 기존 Marker 인터페이스를 확장하여 setZIndex 함수를 추가합니다.
  interface Marker {
    setZIndex(zIndex: number): void;
  }

  // 기존 Map 인터페이스를 확장하여 panTo 함수를 추가합니다.
  interface Map {
    panTo(latlng: kakao.maps.LatLng): void;
  }
}