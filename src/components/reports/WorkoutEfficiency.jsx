import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Zap, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import CardFallback from './CardFallback';

const WorkoutEfficiency = ({ workouts, userName }) => {
  const [efficiencyData, setEfficiencyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEfficiencyData = async () => {
      if (!workouts || workouts.length === 0) {
        setLoading(false);
        setEfficiencyData(null);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-workout-efficiency', {
          body: { workouts, userName },
        });
        if (error) throw error;
        setEfficiencyData(data);
      } catch (err) {
        console.error("Failed to fetch workout efficiency data:", err);
        setEfficiencyData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEfficiencyData();
  }, [workouts, userName]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800">{label}</p>
          <p className="text-sm text-teal-600">{`Efficienza: ${payload[0].value} kg/min`}</p>
        </div>
      );
    }
    return null;
  };

  const renderPerformanceChange = (change) => {
    if (change === 0) {
      return <span className="text-gray-500">Stabile</span>;
    }
    const isPositive = change > 0;
    return (
      <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
        {isPositive ? '▲' : '▼'} {Math.abs(change)}%
      </span>
    );
  };

  const getClassificationIcon = (classification) => {
    switch (classification) {
      case 'Alta':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'Media':
        return <Zap className="w-6 h-6 text-yellow-500" />;
      case 'Bassa':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </Card>
    );
  }

  if (!efficiencyData || !efficiencyData.chartData || efficiencyData.chartData.length === 0) {
    return (
      <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-teal-500" />
            Efficienza Allenamento (kg/min)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CardFallback message="Dati insufficienti per l'analisi dell'efficienza. Registra durata e carichi per abilitare questo report." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-teal-500" />
          Efficienza Allenamento (kg/min)
        </CardTitle>
        <p className="text-sm text-gray-500">Misura la tua produttività durante le sessioni.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={efficiencyData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={10} />
                <YAxis stroke="#4b5563" fontSize={10} label={{ value: 'kg/min', position: 'insideLeft', angle: -90, dy: 10, fill: '#4b5563' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="efficiency" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="text-center p-4 bg-gray-50/50 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Classificazione AI</div>
              <div className="flex items-center justify-center gap-2 mt-1">
                {getClassificationIcon(efficiencyData.classification)}
                <div className="text-2xl font-bold text-gray-800">{efficiencyData.classification}</div>
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50/50 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Rendimento vs Sett. Prec.</div>
              <div className="text-2xl font-bold mt-1">{renderPerformanceChange(efficiencyData.performanceChange)}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-teal-50 border border-teal-100 rounded-lg">
          <p className="text-sm text-teal-800 italic flex items-start">
            <Sparkles className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-teal-600" />
            <span>{efficiencyData.aiMessage}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(WorkoutEfficiency);