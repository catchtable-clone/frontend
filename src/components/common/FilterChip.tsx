interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function FilterChip({
  label,
  active,
  onClick,
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? 'bg-orange-500 text-white'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {label}
    </button>
  );
}
