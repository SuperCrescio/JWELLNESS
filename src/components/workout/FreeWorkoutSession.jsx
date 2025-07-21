import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, Square, X } from 'lucide-react';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';

const FreeWorkoutSession = ({ onComplete, onExit }) => {
  const { session, clearSession, updateProgress } = useWorkoutSession();
  const [isActive, setIsActive] = useState(true);
  const [time, setTime] = useState(0);

  const calculateElapsedTime = useCallback(() => {
    if (!session.startTime) return 0;
    const start = new Date(session.startTime);
    const now = new Date();
    return Math.floor((now - start) / 1000);
  }, [session.startTime]);

  useEffect(() => {
    setTime(calculateElapsedTime());

    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTime(calculateElapsedTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, calculateElapsedTime]);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // App is in background, but timer continues based on start time
      } else {
        // App is in foreground, recalculate time
        setTime(calculateElapsedTime());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [calculateElapsedTime]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleFinish = () => {
    const durationInMinutes = Math.floor(time / 60);
    onComplete({ duration: durationInMinutes });
    clearSession();
  };

  const formatTime = (seconds) => {
    const getSeconds = `0${seconds % 60}`.slice(-2);
    const minutes = `${Math.floor(seconds / 60)}`;
    const getMinutes = `0${minutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(seconds / 3600)}`.slice(-2);
    return `${getHours}:${getMinutes}:${getSeconds}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center h-full p-4"
    >
      <Card className="w-full max-w-md p-6 sm:p-8 glass-effect border-0 text-center relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onExit}
        >
          <X className="w-5 h-5" />
        </Button>
        <div className="flex items-center justify-center mb-4">
          <Timer className="w-8 h-8 text-purple-500 mr-3" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Allenamento Libero</h2>
        </div>
        <div className="my-8">
          <p className="text-6xl sm:text-8xl font-mono font-bold text-gray-800 tracking-tighter">
            {formatTime(time)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleStartPause}
            size="lg"
            className={`text-lg py-6 ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            }`}
          >
            {isActive ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
            {isActive ? 'Pausa' : 'Riprendi'}
          </Button>
          <Button
            onClick={handleFinish}
            size="lg"
            variant="destructive"
            className="text-lg py-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            disabled={time === 0}
          >
            <Square className="w-6 h-6 mr-2" />
            Termina
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default FreeWorkoutSession;