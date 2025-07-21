import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { X, Pause, Play, StopCircle, Wind, Flame, MapPin } from 'lucide-react';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';

const RunningSession = ({ onComplete, onExit }) => {
  const { session, clearSession } = useWorkoutSession();
  const durationInMinutes = session.sessionData?.duration || 0;
  const totalSeconds = useMemo(() => durationInMinutes * 60, [durationInMinutes]);
  
  const [isRunning, setIsRunning] = useState(true);
  const { toast } = useToast();
  const [elapsed, setElapsed] = useState(0);

  const calculateElapsedTime = useCallback(() => {
    if (!session.startTime) return 0;
    const start = new Date(session.startTime);
    const now = new Date();
    return Math.floor((now - start) / 1000);
  }, [session.startTime]);

  const timeLeft = Math.max(0, totalSeconds - elapsed);
  
  useEffect(() => {
    setElapsed(calculateElapsedTime());
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setElapsed(prevElapsed => prevElapsed + 1);
      }, 1000);
    }
    
    if (timeLeft <= 0 && totalSeconds > 0) {
        handleComplete();
        toast({
            title: "🎉 Corsa terminata!",
            description: "Hai completato il tuo allenamento. Ottimo lavoro!",
        });
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, totalSeconds]);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setElapsed(calculateElapsedTime());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [calculateElapsedTime]);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    setIsRunning(!isRunning);
    toast({
      title: isRunning ? "Corsa in pausa" : "Corsa ripresa",
    });
  };

  const handleComplete = () => {
    const finalElapsed = Math.min(elapsed, totalSeconds);
    const estimatedDistance = (finalElapsed / 60) * 0.15; // Stima: 1km ogni 6.6 min
    const estimatedCalories = (finalElapsed / 60) * 10; // Stima: 10 kcal/min
    
    onComplete({
      duration: Math.round(finalElapsed / 60),
      distance: estimatedDistance.toFixed(2),
      calories: Math.round(estimatedCalories),
    });
    clearSession();
  };

  const progress = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 flex items-center">
            <Wind className="w-6 h-6 mr-2 text-green-500" />
            Sessione di Corsa
          </h1>
        </div>
        <Button onClick={onExit} variant="ghost" size="icon" className="bg-white/50 hover:bg-white/70 rounded-full">
          <X className="w-6 h-6 text-gray-500" />
        </Button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.2, type: 'spring' }}
        className="flex-grow flex items-center justify-center"
      >
        <div className="relative w-64 h-64 sm:w-72 sm:h-72">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="50%" cy="50%" r="48%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
            <motion.circle 
              cx="50%" cy="50%" r="48%" stroke="currentColor" strokeWidth="8" fill="transparent" 
              strokeDasharray={2 * Math.PI * (window.innerWidth > 640 ? 136.2 : 122.88)}
              strokeDashoffset={2 * Math.PI * (window.innerWidth > 640 ? 136.2 : 122.88) * (1 - progress / 100)}
              className="text-green-500"
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-gray-600 text-lg">Tempo Rimanente</p>
            <p className="text-5xl sm:text-6xl font-bold text-gray-800 tracking-tighter my-2">{formatTime(timeLeft)}</p>
            <p className="text-gray-500 text-sm">Obiettivo: {formatTime(totalSeconds)}</p>
          </div>
        </div>
      </motion.div>

      <Card className="p-3 sm:p-4 glass-effect border-0">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5 mr-1" />
              {((elapsed / 60) * 0.15).toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Distanza (km stimati)</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-orange-600 flex items-center justify-center">
              <Flame className="w-5 h-5 mr-1" />
              {Math.round((elapsed / 60) * 10)}
            </div>
            <div className="text-xs text-gray-600">Calorie (stimate)</div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-4">
        <Button onClick={togglePause} variant="outline" size="lg" className="rounded-full w-24 h-24 flex items-center justify-center text-lg">
          {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </Button>
        <Button onClick={handleComplete} variant="destructive" size="lg" className="rounded-full w-24 h-24 flex items-center justify-center text-lg bg-red-500 hover:bg-red-600">
          <StopCircle className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
};

export default RunningSession;