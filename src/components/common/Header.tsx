'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Map, ArrowLeft, UtensilsCrossed, X, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockStores } from '@/lib/mockData';
import { filterStores } from '@/lib/utils';
import type { Store } from '@/types/store';

function SearchDropdown({
  stores,
  onSelect,
}: {
  stores: Store[];
  onSelect?: () => void;
}) {
  return (
    <div className="absolute left-0 right-0 top-full z-50 max-h-64 overflow-y-auto rounded-b-xl border-t border-gray-100 bg-white px-4 py-2 shadow-lg">
      {stores.length > 0 ? (
        stores.map((store) => (
          <Link
            key={store.id}
            href={`/stores/${store.id}`}
            onClick={onSelect}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50"
          >
            <div className="h-9 w-9 flex-shrink-0 rounded-lg bg-gray-200" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900">{store.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{store.category}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Star
                    size={10}
                    className="fill-orange-400 text-orange-400"
                  />
                  {store.rating}
                </span>
                <span>·</span>
                <span className="truncate">{store.address}</span>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <p className="py-4 text-center text-sm text-gray-400">
          검색 결과가 없습니다
        </p>
      )}
    </div>
  );
}

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
  showLogo?: boolean;
  defaultQuery?: string;
  onSearch?: (query: string) => void;
}

export default function Header({
  title,
  showSearch = false,
  showBack = false,
  showLogo = false,
  defaultQuery = '',
  onSearch,
}: HeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [searchOpen, setSearchOpen] = useState(false);
  const [edited, setEdited] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      if (onSearch) {
        onSearch(trimmed);
      } else {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }
      setSearchOpen(false);
    }
  };

  // 로고 헤더 (홈페이지)
  if (showLogo) {
    return (
      <header className="relative sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="flex h-[52px] items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={20} className="text-orange-500" />
            <span className="text-base font-bold text-gray-900">CatchEat</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              <Search size={22} />
            </button>
            <button
              onClick={() => router.push('/map')}
              className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              <Map size={22} />
            </button>
          </div>
        </div>

        {/* 검색창 (토글) */}
        {searchOpen && (
          <>
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 border-t border-gray-100 px-4 py-2"
            >
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
                <Search size={18} className="text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="매장명, 지역 검색"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setQuery('');
                }}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </form>

            {/* 검색 결과 드롭다운 */}
            {query.trim() && (
              <SearchDropdown
                stores={filterStores(mockStores, query)}
                onSelect={() => {
                  setSearchOpen(false);
                  setQuery('');
                }}
              />
            )}
          </>
        )}
      </header>
    );
  }

  // 검색 헤더 (검색/지도 등)
  if (showSearch) {
    return (
      <header className="relative sticky top-0 z-50 border-b border-gray-200 bg-white">
        <form
          onSubmit={handleSearch}
          className="flex h-[52px] items-center gap-3 px-4"
        >
          {showBack && (
            <button type="button" onClick={() => router.back()}>
              <ArrowLeft size={22} className="text-gray-700" />
            </button>
          )}
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setEdited(true);
              }}
              placeholder="매장명, 지역 검색"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            type="button"
            onClick={() => router.push('/map')}
            className="flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <Map size={22} />
          </button>
        </form>

        {/* 검색 드롭다운 */}
        {edited && query.trim() && (
          <SearchDropdown stores={filterStores(mockStores, query)} />
        )}
      </header>
    );
  }

  // 기본 타이틀 헤더
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
