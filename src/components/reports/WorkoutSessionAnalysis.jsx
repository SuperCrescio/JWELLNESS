import React, { useState, useEffect, memo } from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { supabase } from '@/lib/customSupabaseClient';
    import { Loader2, Zap, BarChart, HeartPulse, Sparkles, CheckCircle, AlertTriangle, HelpCircle, Footprints, Flame, Gauge } from 'lucide-react';
    import CardFallback from './CardFallback';
    
    const WorkoutSessionAnalysis = ({ workoutSession, allBiometrics, userName }) => {
      const [analysis, setAnalysis] = useState(null);
      const [loading, setLoading] = useState(true);
    
      useEffect(() => {
        const fetchAnalysis = async () => {
          if (!workoutSession) {
            setLoading(false);
            return;
          }
          setLoading(true);
          try {
            const { data, error } = await supabase.functions.invoke('analyze-workout-session', {
              body: { workoutSession, allBiometrics, userName },
            });
            if (error) throw error;
            setAnalysis(data);
          } catch (err) {
            console.error("Failed to fetch session analysis:", err);
            setAnalysis(null);
          } finally {
            setLoading(false);
          }
        };
    
        fetchAnalysis();
      }, [workoutSession, allBiometrics, userName]);
    
      const getBadge = (badge) => {
        switch (badge) {
          case '✅ Bilanciata':
            return { icon: <CheckCircle className="w-4 h-4" />, text: 'Bilanciata', color: 'bg-green-100 text-green-800' };
          case '⚠️ Squilibrata':
            return { icon: <AlertTriangle className="w-4 h-4" />, text: 'Squilibrata', color: 'bg-yellow-100 text-yellow-800' };
          case '❗️ Non ottimale':
            return { icon: <AlertTriangle className="w-4 h-4" />, text: 'Non ottimale', color: 'bg-red-100 text-red-800' };
          case '🏃‍♂️ Cardio':
            return { icon: <Footprints className="w-4 h-4" />, text: 'Cardio', color: 'bg-sky-100 text-sky-800' };
          default:
            return { icon: <HelpCircle className="w-4 h-4" />, text: 'N/A', color: 'bg-gray-100 text-gray-800' };
        }
      };
    
      if (loading) {
        return (
          <Card className="p-4 bg-white/50 animate-pulse">
            <div className="flex justify-center items-center h-24">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          </Card>
        );
      }
    
      if (!analysis) {
        return (
            <Card className="bg-white/50">
                <CardFallback message={`Analisi non disponibile per la sessione del ${new Date(workoutSession.date).toLocaleDateString('it-IT')}.`} />
            </Card>
        );
      }
    
      const { icon, text, color } = getBadge(analysis.badge);
      const isRunning = workoutSession.type === 'running';
    
      const renderWeightTrainingMetrics = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><Zap size={14} /> Efficienza</p>
            <p className="font-bold text-lg">{analysis.metrics.timeEfficiency.toFixed(1)} <span className="text-xs">kg/min</span></p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><HeartPulse size={14} /> Indice Cardio</p>
            <p className="font-bold text-lg">{analysis.metrics.cardioIndex > 0 ? analysis.metrics.cardioIndex.toFixed(1) : 'N/A'} <span className="text-xs">kg/bpm</span></p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><BarChart size={14} /> Dominanza</p>
            <p className="font-bold text-lg">{analysis.metrics.dominantMuscleGroup || 'N/A'} <span className="text-xs">({analysis.metrics.dominantMuscleVolumePercent.toFixed(0)}%)</span></p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><BarChart size={14} /> Tonnellaggio</p>
            <p className="font-bold text-lg">{analysis.metrics.totalTonnage.toLocaleString('it-IT')} <span className="text-xs">kg</span></p>
          </div>
        </div>
      );

      const renderRunningMetrics = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><Footprints size={14} /> Distanza</p>
            <p className="font-bold text-lg">{analysis.metrics.distance.toFixed(2)} <span className="text-xs">km</span></p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><Gauge size={14} /> Passo</p>
            <p className="font-bold text-lg">{analysis.metrics.pace.toFixed(2)} <span className="text-xs">min/km</span></p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><Flame size={14} /> Calorie</p>
            <p className="font-bold text-lg">{analysis.metrics.calories.toFixed(0)} <span className="text-xs">kcal</span></p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><HeartPulse size={14} /> BPM Medi</p>
            <p className="font-bold text-lg">{analysis.metrics.avgHr > 0 ? analysis.metrics.avgHr.toFixed(0) : 'N/A'}</p>
          </div>
        </div>
      );
    
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-l-4" style={{ borderColor: getBadge(analysis.badge).color.startsWith('bg-green') ? '#22c55e' : (getBadge(analysis.badge).color.startsWith('bg-yellow') ? '#eab308' : (getBadge(analysis.badge).color.startsWith('bg-sky') ? '#0ea5e9' : '#ef4444')) }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-gray-800">
                {workoutSession.workoutName || 'Allenamento'} - {new Date(workoutSession.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
                {icon}
                <span>{text}</span>
              </div>
            </CardHeader>
            <CardContent>
              {isRunning ? renderRunningMetrics() : renderWeightTrainingMetrics()}
              <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-md">
                <p className="text-sm text-indigo-800 italic flex items-start">
                  <Sparkles className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-indigo-600" />
                  <span>{analysis.aiMessage}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };
    
    export default memo(WorkoutSessionAnalysis);