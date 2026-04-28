import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { StoreSummary } from '@/types/store';
import { mockBookmarkFolders } from '@/lib/mockData';
import { toCategoryLabel } from '@/lib/storeEnum';

interface StoreCardProps {
  store: StoreSummary;
}

export default function StoreCard({ store }: StoreCardProps) {
  const folder = mockBookmarkFolders.find((f) =>
    f.storeIds.includes(store.storeId),
  );

  return (
    <Link
      href={`/stores/${store.storeId}`}
      className="flex gap-4 border-b border-gray-100 py-4"
    >
      {/* 매장 이미지 */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
        <img
          src={store.storeImage || '/images/ready_image.png'}
          alt={store.storeName}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/ready_image.png';
          }}
        />
        {folder && (
          <Heart
            size={14}
            className="absolute right-1.5 top-1.5 fill-current"
            style={{ color: folder.color }}
          />
        )}
      </div>

      {/* 매장 정보 */}
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-xs text-gray-400">{toCategoryLabel(store.category)}</span>
        <h3 className="text-sm font-semibold text-gray-900">{store.storeName}</h3>
        <p className="text-xs text-gray-500">{store.address}</p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
          <Star size={11} className="fill-orange-400 text-orange-400" />
          <span>{store.averageStar.toFixed(1)}</span>
          <span className="text-gray-300">·</span>
          <span>리뷰 {store.reviewCount}</span>
        </div>
      </div>
    </Link>
  );
}
