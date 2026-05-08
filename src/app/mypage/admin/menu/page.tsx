'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Upload, X, Search } from 'lucide-react';
import Header from '@/components/common/Header';
import { useAuthStore } from '@/stores/authStore';
import { useMeQuery } from '@/lib/userQuery';
import { useStoresQuery } from '@/lib/storeQuery';
import { createMenus, MenuItemRequest } from '@/lib/storeApi';
import { uploadFile } from '@/lib/fileApi';
import { toCategoryLabel } from '@/lib/storeEnum';
import type { StoreSummary } from '@/types/store';
import toast from 'react-hot-toast';

interface MenuFormItem extends MenuItemRequest {
  uploading?: boolean;
}

const emptyMenu = (): MenuFormItem => ({
  menuName: '',
  price: 0,
  description: '',
  menuImage: '',
});

export default function AdminMenuCreatePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  useMeQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<StoreSummary | null>(null);
  const [menus, setMenus] = useState<MenuFormItem[]>([emptyMenu()]);
  const [submitting, setSubmitting] = useState(false);

  // 매장 검색
  const trimmed = searchQuery.trim();
  const { data: searchResults = [] } = useStoresQuery(
    { name: trimmed, size: 5 },
    trimmed.length > 0 && !selectedStore,
  );

  const isReady = accessToken && user;
  const isAdmin = user?.role === 'ADMIN';

  if (!accessToken) {
    return (
      <>
        <Header title="메뉴 등록" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">로그인이 필요합니다.</p>
        </main>
      </>
    );
  }

  if (isReady && !isAdmin) {
    return (
      <>
        <Header title="메뉴 등록" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">관리자만 접근할 수 있습니다.</p>
        </main>
      </>
    );
  }

  // 메뉴 항목 조작
  const updateMenu = (index: number, patch: Partial<MenuFormItem>) => {
    setMenus((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const addMenu = () => setMenus((prev) => [...prev, emptyMenu()]);
  const removeMenu = (index: number) =>
    setMenus((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!selectedStore) {
      toast.error('매장을 먼저 선택해 주세요.');
      return;
    }
    try {
      updateMenu(index, { uploading: true });
      // Option B: stores/{storeId}/menus 하위로 업로드
      const url = await uploadFile(file, 'menu', selectedStore.storeId);
      updateMenu(index, { menuImage: url, uploading: false });
    } catch {
      updateMenu(index, { uploading: false });
      // 에러 토스트는 axios 인터셉터가 처리
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) {
      toast.error('매장을 선택해 주세요.');
      return;
    }
    const validMenus = menus.filter((m) => m.menuName.trim() && m.price > 0);
    if (validMenus.length === 0) {
      toast.error('최소 1개 이상의 메뉴를 입력해 주세요. (메뉴명·가격 필수)');
      return;
    }
    try {
      setSubmitting(true);
      const payload: MenuItemRequest[] = validMenus.map((m) => ({
        menuName: m.menuName.trim(),
        price: m.price,
        description: m.description?.trim() || undefined,
        menuImage: m.menuImage || undefined,
      }));
      const result = await createMenus(selectedStore.storeId, payload);
      toast.success(`메뉴 ${result.menuId.length}개가 등록되었습니다.`);
      router.push(`/stores/${selectedStore.storeId}`);
    } catch {
      // 에러 토스트는 axios 인터셉터가 처리
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title="메뉴 등록" showBack />
      <main className="flex-1 px-4 py-4">
        {/* 1단계 — 매장 선택 */}
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">1. 매장 선택</h2>
          {selectedStore ? (
            <div className="flex items-center justify-between rounded-lg border border-orange-300 bg-orange-50 p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedStore.storeName}</p>
                <p className="text-xs text-gray-500">
                  {toCategoryLabel(selectedStore.category)} · {selectedStore.address}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedStore(null);
                  setSearchQuery('');
                }}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="relative flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="매장명 검색"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
              {trimmed && searchResults.length > 0 && (
                <div className="mt-1 rounded-lg border border-gray-200 bg-white shadow-sm">
                  {searchResults.map((store) => (
                    <button
                      key={store.storeId}
                      type="button"
                      onClick={() => {
                        setSelectedStore(store);
                        setSearchQuery('');
                      }}
                      className="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                        <img
                          src={store.storeImage || '/images/ready_image.png'}
                          alt={store.storeName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/ready_image.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900">{store.storeName}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {toCategoryLabel(store.category)} · {store.address}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* 2단계 — 메뉴 입력 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-900">2. 메뉴 입력</h2>
          {menus.map((menu, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3"
            >
              <div className="flex items-start gap-2">
                <span className="mt-2 text-xs text-gray-400">#{index + 1}</span>
                <div className="flex flex-1 flex-col gap-2">
                  {/* 메뉴명 + 가격 */}
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={menu.menuName}
                      onChange={(e) => updateMenu(index, { menuName: e.target.value })}
                      placeholder="메뉴명 *"
                      className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      value={menu.price}
                      onChange={(e) => updateMenu(index, { price: Number(e.target.value) })}
                      placeholder="가격 *"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  {/* 설명 */}
                  <input
                    type="text"
                    value={menu.description}
                    onChange={(e) => updateMenu(index, { description: e.target.value })}
                    placeholder="설명 (선택)"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  {/* 이미지 업로드 (매장 선택 후에만 활성화) */}
                  <div className="flex items-center gap-2">
                    <label
                      className={`flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700 ${
                        selectedStore ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Upload size={12} />
                      {menu.uploading ? '업로드 중...' : '이미지'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, index)}
                        disabled={menu.uploading || !selectedStore}
                      />
                    </label>
                    {menu.menuImage && (
                      <img
                        src={menu.menuImage}
                        alt="미리보기"
                        className="h-8 w-8 rounded object-cover"
                      />
                    )}
                  </div>
                </div>
                {menus.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMenu(index)}
                    className="flex-shrink-0 rounded p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addMenu}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700"
          >
            <Plus size={14} />
            메뉴 추가
          </button>

          <button
            type="submit"
            disabled={submitting || !selectedStore}
            className="mt-4 w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:bg-gray-300"
          >
            {submitting ? '등록 중...' : '메뉴 등록'}
          </button>
        </form>
      </main>
    </>
  );
}
