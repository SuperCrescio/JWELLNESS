import React from 'react';
import { Card } from '@/components/ui/card';

const MuscleFatAnalysisCard = ({ latestBia }) => {
  if (!latestBia || !latestBia.muscleFatAnalysis || !latestBia.bodyCompositionAnalysis) {
    return (
      <Card className="p-4 glass-effect border-0">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Analisi Muscolo - Grasso</h3>
        <p className="text-xs text-gray-500">Dati non disponibili.</p>
      </Card>
    );
  }

  const { bodyCompositionAnalysis, muscleFatAnalysis } = latestBia;

  const dataPoints = [
    {
      label: 'Peso',
      value: bodyCompositionAnalysis.weightKg,
      // Mocking range and status for now, as they are not in the simplified JSON.
      // This should be adapted if ranges become available again.
      range: '59.9-81.1',
      status: 'Normale',
    },
    {
      label: 'Massa Muscolare',
      value: muscleFatAnalysis.skeletalMuscleMassKg,
      range: '33.5-38.5',
      status: 'Normale',
    },
    {
      label: 'Massa Grassa',
      value: muscleFatAnalysis.bodyFatMassKg,
      range: '8.5-16.9',
      status: 'Sotto',
    },
  ];

  const renderValue = (value, decimals = 1, unit = '') => {
    if (value === undefined || value === null) return '--';
    const num = parseFloat(value);
    if (typeof num === 'number' && !isNaN(num)) {
      return `${num.toFixed(decimals)}${unit}`;
    }
    return '--';
  };
  
  const BarWithRange = ({ value, range, status }) => {
    if (value === undefined || !range) return <div className="h-4 bg-gray-200 rounded-full" />;
    
    // The range format might be string like "59.9-81.1"
    const [min, max] = range.split('-').map(parseFloat);
    
    if (isNaN(min) || isNaN(max)) return <div className="h-4 bg-gray-200 rounded-full" />;
    
    const totalRange = max * 1.5; 
    const valuePercent = (value / totalRange) * 100;
    const minPercent = (min / totalRange) * 100;
    const maxPercent = (max / totalRange) * 100;
    const normalWidth = maxPercent - minPercent;

    const getStatusColorClass = (status) => {
        if (!status) return 'bg-gray-400';
        switch (String(status).toLowerCase()) {
          case 'normale': return 'bg-green-500';
          case 'sotto': return 'bg-blue-500';
          case 'sopra': return 'bg-red-500';
          default: return 'bg-gray-400';
        }
    };

    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
        <div className="bg-gray-300 h-2.5 rounded-full" style={{ width: `${maxPercent}%` }}></div>
        <div className="bg-green-200 h-2.5 rounded-full absolute top-0" style={{ left: `${minPercent}%`, width: `${normalWidth}%` }}></div>
        <div className={`${getStatusColorClass(status)} h-4 w-1 absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md`} style={{ left: `calc(${valuePercent}% - 2px)` }}></div>
      </div>
    );
  };

  const testDate = latestBia.patientInfo?.testDate
    ? new Date(latestBia.patientInfo.testDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric'})
    : '';

  return (
    <Card className="p-4 glass-effect border-0">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Analisi Muscolo - Grasso <span className="font-normal text-gray-500 text-xs">({testDate})</span></h3>
        <div className="space-y-3 text-xs">
            {dataPoints.map(point => (
                <div key={point.label}>
                    <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-700">{point.label}</span>
                        <span className="font-semibold text-gray-800">{renderValue(point.value, 1, ' kg')}</span>
                    </div>
                    <BarWithRange 
                        value={point.value} 
                        range={point.range} 
                        status={point.status} 
                    />
                </div>
            ))}
        </div>
    </Card>
  );
};

export default MuscleFatAnalysisCard;