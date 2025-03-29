import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface InventoryFilterProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export default function InventoryFilter({ activeFilter, onFilterChange }: InventoryFilterProps) {
  // Filter options
  const filters = [
    { id: null, label: 'All Items' },
    { id: 'Fridge', label: 'Fridge' },
    { id: 'Cabinet', label: 'Cabinet' },
    { id: 'expiring', label: 'Expiring Soon' }, // Not implemented in this version
  ];

  return (
    <div className="flex items-center mb-2 pb-2 border-b border-gray-200">
      <div className="flex space-x-2 overflow-x-auto py-1 flex-1 no-scrollbar">
        {filters.map((filter) => (
          <Button
            key={filter.label}
            variant="ghost"
            size="pill"
            className={cn(
              "whitespace-nowrap",
              activeFilter === filter.id 
                ? "bg-primary text-white" 
                : "bg-gray-200 text-gray-700"
            )}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      
      <button className="ml-2 p-1.5 text-gray-500 hover:text-gray-700" aria-label="Sort options">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
      </button>
    </div>
  );
}
