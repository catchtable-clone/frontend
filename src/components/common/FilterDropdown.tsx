'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: string | null;
  onSelect: (key: string | null) => void;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onSelect,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((o) => o.key === selected)?.label;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
          selected
            ? 'border-orange-500 bg-orange-50 text-orange-600'
            : 'border-gray-200 text-gray-600'
        }`}
      >
        {selectedLabel || label}
        <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 max-h-60 w-32 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <button
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50"
            >
              전체
            </button>
            {options.map(({ key, label: optLabel }) => (
              <button
                key={key}
                onClick={() => {
                  onSelect(key);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 ${
                  selected === key
                    ? 'font-medium text-orange-500'
                    : 'text-gray-600'
                }`}
              >
                {optLabel}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
