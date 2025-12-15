'use client';

import { House } from '@/types/house';

interface HouseListProps {
  houses: House[];
  selectedHouse: string | null;
  onSelectHouse: (id: string) => void;
  onDeleteHouse: (id: string) => void;
  onClearAll: () => void;
}

export default function HouseList({
  houses,
  selectedHouse,
  onSelectHouse,
  onDeleteHouse,
  onClearAll,
}: HouseListProps) {
  if (houses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <p>No houses added yet</p>
        <p className="text-sm mt-1">Upload a CSV to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-semibold">{houses.length} Houses</span>
        <button
          onClick={onClearAll}
          className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </button>
      </div>
      <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-red-500/50 scrollbar-track-transparent">
        {houses.map((house) => (
          <div
            key={house.id}
            onClick={() => onSelectHouse(house.id)}
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
              selectedHouse === house.id
                ? 'bg-gradient-to-r from-red-500/30 to-green-500/30 border border-red-500/50'
                : 'bg-black/20 hover:bg-black/30 border border-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                selectedHouse === house.id 
                  ? 'bg-gradient-to-br from-red-500 to-green-500' 
                  : 'bg-red-500/70'
              }`}>
                {house.number}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  House #{house.number}
                </p>
                <p className="text-gray-400 text-sm truncate">{house.address}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteHouse(house.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

