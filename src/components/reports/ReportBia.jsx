import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Activity, TrendingUp, User, Ruler, Weight, Flame, Shield, Droplets, Bone, Beef, BarChart, PieChart, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import BodyCompositionPieChart from './BodyCompositionPieChart';
import ObesityHealthBarChart from './ObesityHealthBarChart';

const ReportBia = ({ userData, filteredData }) => {

  const filteredHistory = filteredData.bia_history || [];

  const getBiaStats = () => {
    const history = filteredHistory || [];
    if (history.length === 0) {
      return null;
    }

    const uniqueHistory = [];
    const seenDates = new Set();
    
    const sortedHistory = [...history]
      .filter(item => item && item.patientInfo?.testDate)
      .sort((a, b) => new Date(b.patientInfo.testDate) - new Date(a.patientInfo.testDate));

    for (const item of sortedHistory) {
      const date = new Date(item.patientInfo.testDate).toDateString();
      if (!seenDates.has(date)) {
        uniqueHistory.push(item);
        seenDates.add(date);
      }
    }
      
    if (uniqueHistory.length === 0) return null;

    return { latest: uniqueHistory[0], history: uniqueHistory };
  };

  const biaStats = getBiaStats();

  const renderValue = (value, decimals = 1, unit = '') => {
    if (value === null || value === undefined) return '--';
    
    const num = parseFloat(value);
    if (typeof num === 'number' && !isNaN(num)) {
      return `${num.toFixed(decimals)}${unit}`;
    }
    
    return typeof value === 'string' ? value : '--';
  };
  
  const renderDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return '--';
    }
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (!biaStats || !biaStats.latest) {
    return (
      <Card className="p-8 sm:p-12 glass-effect border-0 text-center">
        <Activity className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
          Nessuna Analisi BIA
        </h3>
        <p className="text-gray-600 text-sm">
          Carica i risultati per visualizzare questo report.
        </p>
      </Card>
    );
  }
  
  const { latest, history } = biaStats;
  const { patientInfo, bodyCompositionAnalysis, muscleFatAnalysis, obesityDiagnosis, additionalData } = latest;

  const historyData = history.map(item => {
    const itemDate = new Date(item.patientInfo.testDate);
    if (isNaN(itemDate.getTime())) return null;
    return {
      date: itemDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }),
      fullDate: itemDate,
      Peso: item.bodyCompositionAnalysis?.weightKg,
      'Massa Muscolare': item.muscleFatAnalysis?.skeletalMuscleMassKg,
      'Massa Grassa': item.muscleFatAnalysis?.bodyFatMassKg,
    };
  }).filter(Boolean).sort((a, b) => a.fullDate - b.fullDate);

  const StatCard = ({ icon, title, value, unit, small = false }) => (
    <div className={`p-3 rounded-lg flex items-center gap-3 ${small ? 'bg-white/30' : 'bg-white/50'}`}>
        {React.createElement(icon, { className: `w-5 h-5 ${small ? 'text-gray-600' : 'text-purple-600'}` })}
        <div>
            <div className={`font-medium truncate ${small ? 'text-xs text-gray-700' : 'text-sm'}`}>{title}</div>
            <div className="flex items-baseline">
                <span className={`font-bold ${small ? 'text-base text-gray-800' : 'text-lg'}`}>{value}</span>
                <span className={`text-gray-500 ml-1 ${small ? 'text-xs' : 'text-sm'}`}>{unit}</span>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
        <Card className="p-4 glass-effect border-0">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2"><User className="w-4 h-4 text-purple-600"/> Dati Anagrafici</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Ruler} title="Altezza" value={renderValue(patientInfo?.heightCm, 0)} unit="cm" small />
                <StatCard icon={Activity} title="Età" value={renderValue(patientInfo?.age, 0)} unit="anni" small />
                <StatCard icon={User} title="Genere" value={patientInfo?.gender || '--'} unit="" small />
                <StatCard icon={Calendar} title="Data Test" value={renderDate(patientInfo?.testDate)} unit="" small />
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="p-4 glass-effect border-0 lg:col-span-1">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2"><PieChart className="w-4 h-4 text-purple-600"/> Composizione Corporea</h3>
                {bodyCompositionAnalysis && <BodyCompositionPieChart data={bodyCompositionAnalysis} />}
            </Card>
            <Card className="p-4 glass-effect border-0 lg:col-span-2">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2"><BarChart className="w-4 h-4 text-purple-600"/> Indice di Obesità e Salute</h3>
                {obesityDiagnosis && additionalData && <ObesityHealthBarChart obesityData={obesityDiagnosis} additionalData={additionalData} />}
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="p-4 glass-effect border-0">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2"><BarChart className="w-4 h-4 text-purple-600"/> Analisi Muscolo / Grasso</h3>
                <div className="space-y-3 mt-4">
                    <StatCard icon={Weight} title="Peso Totale" value={renderValue(bodyCompositionAnalysis?.weightKg)} unit="kg" />
                    <StatCard icon={Beef} title="Massa Muscolare" value={renderValue(muscleFatAnalysis?.skeletalMuscleMassKg)} unit="kg" />
                    <StatCard icon={Shield} title="Massa Grassa" value={renderValue(muscleFatAnalysis?.bodyFatMassKg)} unit="kg" />
                </div>
            </Card>
             <Card className="p-4 glass-effect border-0">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2"><Flame className="w-4 h-4 text-purple-600"/>Parametri di Ricerca</h3>
                <div className="space-y-3 mt-4">
                    <StatCard icon={Droplets} title="Massa Magra" value={renderValue(bodyCompositionAnalysis?.fatFreeMassKg)} unit="kg" />
                    <StatCard icon={Flame} title="Metabolismo Basale" value={renderValue(additionalData?.basalMetabolicRateKcal, 0)} unit="kcal" />
                    <StatCard icon={Beef} title="SMI" value={renderValue(additionalData?.skeletalMuscleIndex)} unit="" />
                    <StatCard icon={Activity} title="Grado Obesità" value={renderValue(additionalData?.obesityDegree)} unit="%" />
                </div>
            </Card>
        </div>

        <Card className="p-3 sm:p-4 md:p-6 glass-effect border-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" />
            <span className="truncate">Storia della Composizione Corporea</span>
            </h3>
            {historyData.length > 1 ? (
            <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historyData}>
                <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tick={{ fill: '#4b5563' }} />
                <YAxis yAxisId="left" stroke="#8884d8" fontSize={10} tick={{ fill: '#8884d8' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={10} tick={{ fill: '#ef4444' }} />
                <Tooltip contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '0.5rem', fontSize: '12px'}}/>
                <Legend wrapperStyle={{fontSize: "10px"}}/>
                <Line yAxisId="left" type="monotone" dataKey="Peso" stroke="#8884d8" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} name="Peso (kg)" />
                <Line yAxisId="left" type="monotone" dataKey="Massa Muscolare" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} name="Muscolo (kg)" />
                <Line yAxisId="right" type="monotone" dataKey="Massa Grassa" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} name="Grasso (kg)" />
            </LineChart>
            </ResponsiveContainer>
            ) : (
            <div className="text-center text-gray-500 py-10">
                <p>Carica più report BIA per vedere la storia della composizione corporea.</p>
            </div>
            )}
        </Card>
    </div>
  );
};

export default ReportBia;