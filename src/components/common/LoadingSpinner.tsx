export default function LoadingSpinner({ message = '로딩 중...' }: { message?: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}
