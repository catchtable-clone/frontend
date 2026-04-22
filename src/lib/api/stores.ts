import api from '@/lib/axios';
import {
  BackendDistrict,
  CATEGORY_LABEL,
  Store,
  StoreListResponseDto,
} from '@/types/store';

interface ApiEnvelope<T> {
  status: number;
  message: string;
  data: T;
}

function toStore(dto: StoreListResponseDto): Store {
  return {
    id: dto.storeId,
    name: dto.storeName,
    category: CATEGORY_LABEL[dto.category] ?? dto.category,
    address: dto.address,
    rating: 0,
    reviewCount: 0,
    imageUrl: dto.storeImage ?? '',
    openTime: '',
    closeTime: '',
    lat: dto.latitude,
    lng: dto.longitude,
  };
}

export async function searchStoresByName(name: string): Promise<Store[]> {
  const res = await api.get<ApiEnvelope<StoreListResponseDto[]>>('/stores', {
    params: { name },
  });
  return res.data.data.map(toStore);
}

export async function getStoresByDistrict(
  district: BackendDistrict,
): Promise<Store[]> {
  const res = await api.get<ApiEnvelope<StoreListResponseDto[]>>(
    '/stores/district',
    { params: { district } },
  );
  return res.data.data.map(toStore);
}
