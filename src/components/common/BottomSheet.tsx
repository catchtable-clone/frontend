interface BottomSheetProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function BottomSheet({ children, onClose }: BottomSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[480px] rounded-t-2xl bg-white px-5 pb-5 pt-6">
        {children}
      </div>
    </div>
  );
}
