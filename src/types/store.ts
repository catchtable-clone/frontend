export interface Store {
  id: number;
  name: string;
  category: string;
  address: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  openTime: string;
  closeTime: string;
  lat: number;
  lng: number;
  isClosed?: boolean;
}

export interface Menu {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}
