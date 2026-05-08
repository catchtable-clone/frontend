'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import Header from '@/components/common/Header';
import { useAuthStore } from '@/stores/authStore';
import { useMeQuery } from '@/lib/userQuery';
import { createStore, updateStore, StoreCreateRequest } from '@/lib/storeApi';
import { uploadFile } from '@/lib/fileApi';
import { STORE_CATEGORIES, STORE_DISTRICTS } from '@/lib/storeEnum';
import toast from 'react-hot-toast';

export default function AdminStoreCreatePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  useMeQuery(); // user 정보 동기화

  const [form, setForm] = useState<StoreCreateRequest>({
    storeName: '',
    storeImage: '',
    category: 'KOREAN',
    latitude: 37.4979,
    longitude: 127.0276,
    address: '',
    district: 'GANGNAM',
    team: 4,
    openTime: '09:00',
    closeTime: '22:00',
  });
  // Option B: 매장 등록 시점에 storeId가 없으므로, 이미지는 submit 단계에서 업로드한다.
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const isReady = accessToken && user;
  const isAdmin = user?.role === 'ADMIN';

  if (!accessToken) {
    return (
      <>
        <Header title="매장 등록" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">로그인이 필요합니다.</p>
        </main>
      </>
    );
  }

  if (isReady && !isAdmin) {
    return (
      <>
        <Header title="매장 등록" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">관리자만 접근할 수 있습니다.</p>
        </main>
      </>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    // 로컬 미리보기 (실제 업로드는 submit 시점에 storeId와 함께 수행)
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeName.trim() || !form.address.trim()) {
      toast.error('매장명과 주소는 필수입니다.');
      return;
    }
    try {
      setSubmitting(true);

      // 1단계 — 이미지 없이 매장 등록 (storeId 확보)
      const created = await createStore({ ...form, storeImage: '' });
      const storeId = created.storeId;

      // 2단계 — 이미지가 있다면 storeId 폴더에 업로드
      let storeImageUrl = '';
      if (imageFile) {
        storeImageUrl = await uploadFile(imageFile, 'store', storeId);
        // 3단계 — 업로드된 URL을 매장 정보에 반영
        await updateStore(storeId, { ...form, storeImage: storeImageUrl });
      }

      toast.success(`매장이 등록되었습니다. (ID: ${storeId})`);
      router.push(`/stores/${storeId}`);
    } catch {
      // 에러 토스트는 axios 인터셉터가 처리
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title="매장 등록" showBack />
      <main className="flex-1 px-4 py-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 매장명 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">매장명 *</label>
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="예: 스시 소라"
              required
            />
          </div>

          {/* 카테고리 / 지역 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">카테고리 *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {STORE_CATEGORIES.map((c) => (
                  <option key={c.enumValue} value={c.enumValue}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">지역 (구) *</label>
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                {STORE_DISTRICTS.map((d) => (
                  <option key={d.enumValue} value={d.enumValue}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 주소 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">주소 *</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="서울특별시 ..."
              required
            />
          </div>

          {/* 위경도 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">위도 *</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">경도 *</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          {/* 수용 인원 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">수용 인원(팀) *</label>
            <input
              type="number"
              min="1"
              value={form.team}
              onChange={(e) => setForm({ ...form, team: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          {/* 운영시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">오픈 *</label>
              <input
                type="time"
                value={form.openTime}
                onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">마감 *</label>
              <input
                type="time"
                value={form.closeTime}
                onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          {/* 이미지 업로드 (등록 시점에 storeId 폴더로 함께 업로드) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">매장 이미지</label>
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Upload size={16} />
                {imageFile ? imageFile.name : '파일 선택'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              매장 등록 후 stores/{'{storeId}'}/store 폴더에 저장됩니다.
            </p>
          </div>

          {/* 제출 */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:bg-gray-300"
          >
            {submitting ? '등록 중...' : '매장 등록'}
          </button>
        </form>
      </main>
    </>
  );
}
