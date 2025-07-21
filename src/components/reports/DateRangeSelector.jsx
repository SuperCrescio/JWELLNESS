import React from 'react';
import { Button } from '@/components/ui/button';

const DateRangeSelector = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { id: 'total', label: 'Totale' },
    { id: 'today', label: 'Oggi' },
    { id: 'week', label: 'Settimana' },
    { id: 'month', label: 'Mese' },
    { id: 'quarter', label: 'Trimestre' },
    { id: 'year', label: 'Anno' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ranges.map(range => (
        <Button
          key={range.id}
          variant={selectedRange === range.id ? "default" : "outline"}
          size="sm"
          className={`text-xs h-8 ${selectedRange === range.id 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
            : 'bg-white/60 hover:bg-white/80'
          }`}
          onClick={() => onRangeChange(range.id)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
};

export default DateRangeSelector;