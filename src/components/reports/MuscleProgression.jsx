import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Sparkles, Activity } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import CardFallback from './CardFallback';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'];

const CustomTooltipContent = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm" style={{ color: p.color }}>
            {`${p.name}: ${p.value.toLocaleString('it-IT')} kg`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MuscleProgression = ({ workouts, userName }) => {
  const [progressionData, setProgressionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgression = async () => {
      if (!workouts || workouts.length === 0) {
        setLoading(false);
        setProgressionData(null);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-muscle-progression', {
          body: { workouts, userName },
        });
        if (error) throw error;
        setProgressionData(data);
      } catch (err) {
        console.error("Failed to fetch muscle progression:", err);
        setProgressionData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProgression();
  }, [workouts, userName]);

  const renderProgressionItem = (item) => {
    let Icon, colorClass;
    if (item.change > 5) {
      Icon = TrendingUp;
      colorClass = 'text-green-500';
    } else if (item.change < -5) {
      Icon = TrendingDown;
      colorClass = 'text-red-500';
    } else {
      Icon = Minus;
      colorClass = 'text-gray-500';
    }

    return (
      <div key={item.group} className="p-3 bg-gray-50/50 rounded-lg flex items-center justify-between">
        <span className="font-medium text-gray-700 text-sm">{item.group}</span>
        <div className={`flex items-center font-semibold ${colorClass}`}>
          <Icon className="w-4 h-4 mr-1" />
          <span>{item.change > 0 ? '+' : ''}{item.change}%</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </Card>
    );
  }

  if (!progressionData || !progressionData.chartData || progressionData.chartData.length < 2) {
    return (
      <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-cyan-500" />
            Progressione Muscolare per Gruppo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CardFallback message={progressionData?.aiMessage || "Dati insufficienti per l'analisi della progressione. Sono necessarie almeno due periodi di allenamenti registrati."} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-cyan-500" />
          Progressione Muscolare per Gruppo (Trend Radar)
        </CardTitle>
        <p className="text-sm text-gray-500">Confronta il volume di lavoro per gruppo muscolare nel tempo.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="w-full h-96">
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={progressionData.chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="periodLabel" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 1000']} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: '20px' }} />
                {progressionData.muscleGroups.map((group, i) => (
                  <Radar key={group} name={group} dataKey={group} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.2} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-2">Progressione vs Periodo Prec.</h3>
              <div className="grid grid-cols-2 gap-3">
                {progressionData.progression.map(renderProgressionItem)}
              </div>
            </div>
            <div className="mt-4 p-4 bg-cyan-50 border border-cyan-100 rounded-lg">
              <p className="text-sm text-cyan-800 italic flex items-start">
                <Sparkles className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-cyan-600" />
                <span>{progressionData.aiMessage}</span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(MuscleProgression);