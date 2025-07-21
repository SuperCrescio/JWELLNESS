import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Clock, BarChart, TrendingUp, Target } from 'lucide-react';
import { Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, BarChart as ReBarChart } from 'recharts';

const ReportMeditation = ({ filteredData }) => {

  const filteredSessions = filteredData.meditation_sessions || [];

  const getMeditationStats = () => {
    const sessions = (filteredSessions || []).filter(s => s.obiettivo && typeof s.durata_effettiva === 'number');

    if (sessions.length === 0) {
      return null;
    }

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.durata_effettiva, 0);
    const avgDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    const objectiveData = sessions.reduce((acc, session) => {
      const objective = session.obiettivo;
      const minutes = session.durata_effettiva;
      const existing = acc.find(item => item.name === objective);
      if (existing) {
        existing.minutes += minutes;
      } else {
        acc.push({ name: objective, minutes });
      }
      return acc;
    }, []);

    const historyData = sessions
      .map(session => ({
        date: new Date(session.timestamp).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
        fullDate: new Date(session.timestamp),
        duration: session.durata_effettiva,
      }))
      .sort((a, b) => a.fullDate - b.fullDate);

    return {
      totalSessions,
      totalMinutes,
      avgDuration,
      objectiveData,
      historyData,
    };
  };

  const meditationStats = getMeditationStats();

  if (!meditationStats) {
    return (
      <Card className="p-8 sm:p-12 glass-effect border-0 text-center">
        <BrainCircuit className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
          Nessun Dato di Meditazione
        </h3>
        <p className="text-gray-600 text-sm">
          Completa le tue sessioni per visualizzare questo report.
        </p>
      </Card>
    );
  }

  const objectiveColors = {
    'Meditazione': '#8884d8',
    'Rilassamento': '#82ca9d',
    'Focus': '#ffc658',
  };

  const getMaxYValue = (data, key) => {
    const maxValue = Math.max(...data.map(item => item[key]), 0);
    return Math.min(Math.ceil((maxValue + 5) / 5) * 5, 60);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="p-3 sm:p-4 md:p-6 glass-effect border-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-500" />
          <span className="truncate">Riepilogo Meditazione</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-lg text-white">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">{meditationStats.totalSessions}</div>
            <div className="text-xs sm:text-sm opacity-90">Sessioni Totali</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg text-white">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">{meditationStats.totalMinutes}</div>
            <div className="text-xs sm:text-sm opacity-90">Minuti Totali</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-teal-400 to-teal-600 rounded-lg text-white">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
            <div className="text-lg sm:text-2xl font-bold">{meditationStats.avgDuration}</div>
            <div className="text-xs sm:text-sm opacity-90">Durata Media (min)</div>
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4 md:p-6 glass-effect border-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <BarChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" />
          <span className="truncate">Minuti per Obiettivo</span>
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <ReBarChart data={meditationStats.objectiveData}>
            <XAxis dataKey="name" stroke="#4b5563" fontSize={10} />
            <YAxis stroke="#4b5563" fontSize={10} domain={[0, getMaxYValue(meditationStats.objectiveData, 'minutes')]} />
            <Tooltip contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '0.5rem', fontSize: '12px'}}/>
            <Bar dataKey="minutes" name="Minuti" unit=" min">
              {meditationStats.objectiveData.map((entry, index) => (
                <Bar key={`cell-${index}`} fill={objectiveColors[entry.name] || '#8884d8'} />
              ))}
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
      </Card>

      {meditationStats.historyData.length > 1 && (
        <Card className="p-3 sm:p-4 md:p-6 glass-effect border-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
            <span className="truncate">Andamento Sessioni (minuti)</span>
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={meditationStats.historyData}>
              <XAxis dataKey="date" stroke="#4b5563" fontSize={10} />
              <YAxis stroke="#4b5563" fontSize={10} domain={[0, getMaxYValue(meditationStats.historyData, 'duration')]} />
              <Tooltip contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '0.5rem', fontSize: '12px'}}/>
              <Legend wrapperStyle={{fontSize: "10px"}}/>
              <Line type="monotone" dataKey="duration" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} name="Durata (min)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};

export default ReportMeditation;