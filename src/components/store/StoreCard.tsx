import Link from 'next/link';
import { Star, Clock } from 'lucide-react';
import { Store } from '@/types/store';

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link
      href={`/stores/${store.id}`}
      className="flex gap-4 border-b border-gray-100 py-4"
    >
      {/* 매장 이미지 */}
      <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-200" />

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
            {store.openTime} - {store.closeTime}
          </span>
        </div>
      </div>
    </Link>
  );
}
