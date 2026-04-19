interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function Tabs({ items, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-gray-200">
      {items.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeKey === key
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-gray-400'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
