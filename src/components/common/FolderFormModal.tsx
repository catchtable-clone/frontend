'use client';

import { useState } from 'react';
import CenteredModal from './CenteredModal';
import { FOLDER_COLORS } from '@/types/store';
import type { BookmarkFolder } from '@/types/store';

interface FolderFormModalProps {
  mode: 'create' | 'edit';
  folder?: BookmarkFolder;
  onSubmit: (name: string, color: string) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function FolderFormModal({
  mode,
  folder,
  onSubmit,
  onDelete,
  onClose,
}: FolderFormModalProps) {
  const [name, setName] = useState(folder?.name ?? '');
  const [color, setColor] = useState<string>(
    folder?.color ?? FOLDER_COLORS[0].value,
  );

  return (
    <CenteredModal onClose={onClose}>
      <h3 className="text-lg font-semibold text-gray-900">
        {mode === 'create' ? '새 폴더 만들기' : '폴더 편집'}
      </h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="폴더 이름을 입력하세요"
        className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none"
        autoFocus
        onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSubmit(name.trim(), color)}
      />
      <div className="mt-3">
        <p className="mb-2 text-xs font-medium text-gray-600">폴더 색상</p>
        <div className="flex gap-2">
          {FOLDER_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{
                backgroundColor: c.value,
                outline: color === c.value ? `2px solid ${c.value}` : 'none',
                outlineOffset: '2px',
              }}
            >
              {color === c.value && (
                <span className="text-xs text-white">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => name.trim() && onSubmit(name.trim(), color)}
          disabled={!name.trim()}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white ${
            name.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300'
          }`}
        >
          {mode === 'create' ? '만들기' : '저장'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          취소
        </button>
        {mode === 'edit' && onDelete && folder?.type !== 'DEFAULT' && (
          <button
            onClick={onDelete}
            className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600"
          >
            삭제
          </button>
        )}
      </div>
    </CenteredModal>
  );
}
