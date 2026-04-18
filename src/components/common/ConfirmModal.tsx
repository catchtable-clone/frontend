import { X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative mx-4 w-full max-w-[360px] rounded-2xl bg-white p-6">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            돌아가기
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
