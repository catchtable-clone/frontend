'use client';

import { Search, Map, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
}

export default function Header({
  title,
  showSearch = false,
  showBack = false,
}: HeaderProps) {
  const router = useRouter();

  if (showSearch) {
    return (
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="flex h-[52px] items-center gap-3 px-4">
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="매장명, 지역 검색"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => router.push('/map')}
            className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <Map size={22} />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="flex h-[52px] items-center gap-3 px-4">
        {showBack && (
          <button onClick={() => router.back()}>
            <ArrowLeft size={22} className="text-gray-700" />
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
}
