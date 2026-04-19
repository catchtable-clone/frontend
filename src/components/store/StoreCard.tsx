import Link from 'next/link';
import { Star, Clock, Heart } from 'lucide-react';
import { Store } from '@/types/store';
import { mockBookmarkFolders } from '@/lib/mockData';

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  const isClosed = store.isClosed ?? false;
  const folder = mockBookmarkFolders.find((f) =>
    f.storeIds.includes(store.id),
  );

  return (
    <Link
      href={`/stores/${store.id}`}
      className={`flex gap-4 border-b border-gray-100 py-4 ${isClosed ? 'opacity-50' : ''}`}
    >
      {/* 매장 이미지 */}
      <div className="relative h-20 w-20 flex-shrink-0 rounded-lg bg-gray-200">
        {isClosed && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-gray-700 px-2 py-0.5 text-[10px] font-semibold text-white">
            휴업중
          </span>
        )}
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{store.category}</span>
        </div>
        <h3 className="text-sm font-semibold text-gray-900">{store.name}</h3>
        <p className="text-xs text-gray-500">{store.address}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Star size={12} className="fill-orange-400 text-orange-400" />
            {store.rating}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {isClosed ? '휴업중' : `${store.openTime} - ${store.closeTime}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
