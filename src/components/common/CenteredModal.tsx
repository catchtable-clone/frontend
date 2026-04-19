interface CenteredModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function CenteredModal({
  children,
  onClose,
}: CenteredModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-[360px] rounded-2xl bg-white p-6">
        {children}
      </div>
    </div>
  );
}
