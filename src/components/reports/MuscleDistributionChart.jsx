import React, { useState, useEffect, memo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { Dumbbell, Shield, User, Heart } from 'lucide-react';
import CardFallback from './CardFallback';
import { supabase } from '@/lib/customSupabaseClient';

const muscleGroupsConfig = {
  'Petto': { icon: <Dumbbell className="w-5 h-5 text-red-500" />, color: '#ef4444' },
  'Schiena': { icon: <Shield className="w-5 h-5 text-blue-500" />, color: '#3b82f6' },
  'Gambe': { icon: <Dumbbell className="w-5 h-5 text-green-500" />, color: '#22c55e' },
  'Spalle': { icon: <User className="w-5 h-5 text-yellow-500" />, color: '#eab308' },
  'Core': { icon: <Shield className="w-5 h-5 text-cyan-500" />, color: '#06b6d4' },
  'Braccia': { icon: <Heart className="w-5 h-5 text-purple-500" />, color: '#a855f7' },
  'Altro': { icon: <Dumbbell className="w-5 h-5 text-gray-500" />, color: '#6b7280' },
};

const CustomTooltipContent = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{data.payload.subject}</p>
        <p className="text-sm" style={{ color: data.color }}>{`Volume: ${data.value.toLocaleString('it-IT')}`}</p>
        <p className="text-sm text-gray-600">{`Percentuale: ${data.payload.percentage.toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

const MuscleDistributionChart = ({ workouts }) => {
  const [muscleDistribution, setMuscleDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!workouts || workouts.length === 0) {
      setLoading(false);
      setMuscleDistribution(null);
      return;
    }

    const analyzeDistribution = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: funcError } = await supabase.functions.invoke('analyze-muscle-distribution', {
          body: { workouts },
        });

        if (funcError) throw funcError;
        setMuscleDistribution(data);
      } catch (err) {
        console.error("Errore analisi AI distribuzione muscolare:", err);
        setError("L'analisi AI non è riuscita. Verrà usata l'analisi standard.");
        // Fallback to local calculation if AI fails
        const localAnalysis = calculateLocalDistribution(workouts);
        setMuscleDistribution(localAnalysis);
      } finally {
        setLoading(false);
      }
    };

    analyzeDistribution();
  }, [workouts]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
     return <CardFallback message={error} />;
  }
  
  if (!muscleDistribution || muscleDistribution.data.length === 0 || muscleDistribution.list.every(item => item.volume === 0)) {
    return <CardFallback message="Nessun dato di volume muscolare disponibile. Completa almeno una sessione con carichi registrati nel periodo selezionato." />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
      <div className="w-full h-80">
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={muscleDistribution.data}>
            <defs>
                <radialGradient id="radarGradient">
                <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
                <stop offset="100%" stopColor="rgba(168, 85, 247, 0.1)" />
                </radialGradient>
            </defs>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
            <Radar name="Volume" dataKey="volume" stroke="#a855f7" fill="url(#radarGradient)" fillOpacity={0.8} />
            <Tooltip content={<CustomTooltipContent />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <ul className="space-y-2">
          {muscleDistribution.list.map(item => (
            item.volume > 0 &&
            <li key={item.subject} className="flex items-center justify-between text-sm p-2 rounded-md bg-gray-50/50">
              <div className="flex items-center">
                {muscleGroupsConfig[item.subject] ? muscleGroupsConfig[item.subject].icon : muscleGroupsConfig['Altro'].icon}
                <span className="ml-2 font-medium text-gray-700">{item.subject}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-800">{item.volume.toLocaleString('it-IT')}</span>
                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-bold ${item.status.includes('OK') ? 'bg-green-100 text-green-800' : item.status.includes('Trascurato') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-sm text-gray-600 italic p-3 bg-indigo-50 border border-indigo-100 rounded-lg">{muscleDistribution.feedback}</p>
      </div>
    </div>
  );
};


// Fallback function in case AI fails
const calculateLocalDistribution = (workouts) => {
    const muscleMap = {
      'panca': 'Petto', 'chest press': 'Petto', 'croci': 'Petto', 'push-up': 'Petto', 'dips': 'Petto',
      'rematore': 'Schiena', 'trazioni': 'Schiena', 'lat machine': 'Schiena', 'stacco': 'Schiena', 'deadlift': 'Schiena', 'pull-up': 'Schiena',
      'squat': 'Gambe', 'leg press': 'Gambe', 'affondi': 'Gambe', 'lunge': 'Gambe', 'leg extension': 'Gambe', 'leg curl': 'Gambe',
      'military press': 'Spalle', 'alzate laterali': 'Spalle', 'aperture laterali': 'Spalle', 'shoulder press': 'Spalle', 'overhead press': 'Spalle',
      'curl': 'Braccia', 'bicipiti': 'Braccia', 'tricipiti': 'Braccia', 'french press': 'Braccia',
      'crunch': 'Core', 'plank': 'Core', 'addome': 'Core', 'leg raise': 'Core'
    };
    const getMuscleGroup = (exerciseName) => {
        const name = exerciseName?.toLowerCase() || '';
        for (const keyword in muscleMap) {
            if (name.includes(keyword)) return muscleMap[keyword];
        }
        return 'Altro';
    };

    const volumeByGroup = { 'Petto': 0, 'Schiena': 0, 'Gambe': 0, 'Spalle': 0, 'Core': 0, 'Braccia': 0 };

    (workouts || []).forEach(workout => {
      (workout.exercises || []).forEach(exercise => {
        const muscleGroup = getMuscleGroup(exercise.name);
        if (muscleGroup !== 'Altro') {
          const exerciseVolume = (exercise.completedSets || []).reduce((total, set) => {
            const reps = parseFloat(set.reps);
            const weight = parseFloat(set.weight);
            if (!isNaN(reps) && weight === 0) return total + reps;
            if (!isNaN(reps) && !isNaN(weight)) return total + (reps * weight);
            return total;
          }, 0);
          volumeByGroup[muscleGroup] += exerciseVolume;
        }
      });
    });

    const totalVolume = Object.values(volumeByGroup).reduce((sum, vol) => sum + vol, 0);
    if (totalVolume === 0) return { data: [], list: [], feedback: '' };

    const chartData = Object.keys(volumeByGroup).map(group => ({
      subject: group,
      volume: volumeByGroup[group],
      percentage: (volumeByGroup[group] / totalVolume) * 100
    }));

    const listData = chartData.map(item => {
      let status = '✅ OK';
      if (item.percentage > 35) status = '❗️ Sovraccarico';
      else if (item.percentage > 0 && item.percentage < 10) status = '⚠️ Trascurato';
      return { ...item, status };
    }).sort((a,b) => b.volume - a.volume);
    
    return { data: chartData, list: listData, feedback: "Analisi locale: controlla la distribuzione del volume per un allenamento bilanciato." };
};

export default memo(MuscleDistributionChart);