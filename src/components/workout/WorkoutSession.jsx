import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Heart, X, Info, ChevronLeft, ChevronRight, SkipForward, Weight } from 'lucide-react';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';

const RepsDisplay = ({ text }) => {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const container = containerRef.current;
        if (container && text) {
            const parentWidth = container.offsetWidth;
            const textWidth = container.scrollWidth;
            if (textWidth > parentWidth) {
                setScale(parentWidth / textWidth);
            } else {
                setScale(1);
            }
        } else {
            setScale(1);
        }
    }, [text]);

    return (
        <div ref={containerRef} className="text-lg font-bold text-gray-800 break-words whitespace-normal leading-tight" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
            {text || 'N/A'}
        </div>
    );
};


const WorkoutSession = ({ onComplete, onExit }) => {
  const { session, updateProgress, clearSession } = useWorkoutSession();
  const { sessionData: workout, progress } = session;

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(progress.currentExerciseIndex || 0);
  const [currentSetIndex, setCurrentSetIndex] = useState(progress.currentSetIndex || 0);
  const [completedExercisesData, setCompletedExercisesData] = useState(progress.completedExercisesData || []);

  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [heartRate, setHeartRate] = useState(null);
  const [currentWeight, setCurrentWeight] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const { toast } = useToast();

  const calculateElapsedTime = useCallback(() => {
    if (!session.startTime) return 0;
    const start = new Date(session.startTime);
    const now = new Date();
    return Math.floor((now - start) / 1000);
  }, [session.startTime]);

  useEffect(() => {
    const interval = setInterval(() => {
        setElapsed(calculateElapsedTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateElapsedTime]);
  
  const currentExercise = useMemo(() => {
    return workout.exercises[currentExerciseIndex];
  }, [workout.exercises, currentExerciseIndex]);
  
  useEffect(() => {
    if (!progress.completedExercisesData || progress.completedExercisesData.length === 0) {
      const initialCompleted = workout.exercises.map(ex => ({
        exerciseName: ex.name,
        notes: ex.notes,
        sets: ex.sets,
        reps: ex.reps,
        completedSets: []
      }));
      setCompletedExercisesData(initialCompleted);
      updateProgress({ completedExercisesData: initialCompleted });
    }
  }, [workout.exercises, progress.completedExercisesData, updateProgress]);

  const totalSets = currentExercise?.sets || 0;

  const getRepsForCurrentSet = () => {
    if (!currentExercise || !currentExercise.reps) return 'N/A';
    const repsString = String(currentExercise.reps);
    const repsArray = repsString.split(/[\s-]+/).filter(Boolean).map(s => s.trim());
    if (repsArray.length > 1 && repsArray.length >= totalSets) {
        return repsArray[currentSetIndex] || repsArray[repsArray.length - 1];
    }
    return repsString;
  };
  
  const repsForThisSet = getRepsForCurrentSet();
  const restDuration = currentExercise?.rest || 60;
  
  const parseReps = (repsString) => {
    if (!repsString) return 0;
    const s = String(repsString);
    if (s.toLowerCase().includes('max') || s.toLowerCase().includes('cedimento')) {
        return 12; // Assign a default high value for 'max' reps for volume calculation
    }
    const numbers = s.match(/\d+/g);
    if (numbers) {
        return Math.max(...numbers.map(Number));
    }
    return 0;
  };

  const handleRestEnd = useCallback(() => {
    setIsResting(false);
    updateProgress({ restEndTime: null });
    toast({
      title: "⏰ Tempo di riposo terminato!",
      description: "Pronto per la prossima serie!",
    });
  }, [toast, updateProgress]);

  useEffect(() => {
    if (progress.restEndTime) {
      const endTime = new Date(progress.restEndTime).getTime();
      const now = Date.now();
      if (now < endTime) {
        setIsResting(true);
        setRestTimer(Math.round((endTime - now) / 1000));
      } else {
        setIsResting(false);
        updateProgress({ restEndTime: null });
      }
    }
  }, [progress.restEndTime, updateProgress]);

  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            handleRestEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer, handleRestEnd]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(Math.floor(Math.random() * 40) + 120);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const completeSet = () => {
    const newCompletedData = JSON.parse(JSON.stringify(completedExercisesData));
    newCompletedData[currentExerciseIndex].completedSets.push({
      reps: parseReps(repsForThisSet),
      weight: parseFloat(currentWeight) || 0,
      rawReps: repsForThisSet,
    });
    setCompletedExercisesData(newCompletedData);
    setCurrentWeight('');

    if (currentSetIndex < totalSets - 1) {
      const endTime = new Date(Date.now() + restDuration * 1000).toISOString();
      setRestTimer(restDuration);
      setIsResting(true);
      setCurrentSetIndex(prev => prev + 1);
      updateProgress({ 
        currentSetIndex: currentSetIndex + 1, 
        completedExercisesData: newCompletedData,
        restEndTime: endTime 
      });
    } else {
      handleNextExercise(newCompletedData);
    }
  };

  const handleNextExercise = (updatedData = completedExercisesData) => {
    setIsResting(false);
    setRestTimer(0);
    if (currentExerciseIndex < workout.exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setCurrentSetIndex(0);
      updateProgress({ currentExerciseIndex: nextIndex, currentSetIndex: 0, completedExercisesData: updatedData, restEndTime: null });
    } else {
      const duration = Math.round(elapsed / 60);
      onComplete({ duration, avgHeartRate: heartRate, completedExercises: updatedData });
      clearSession();
    }
  }

  const handlePrevExercise = () => {
     if (currentExerciseIndex > 0) {
        const prevIndex = currentExerciseIndex - 1;
        setIsResting(false);
        setRestTimer(0);
        setCurrentExerciseIndex(prevIndex);
        setCurrentSetIndex(0);
        updateProgress({ currentExerciseIndex: prevIndex, currentSetIndex: 0, restEndTime: null });
     }
  }

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
    updateProgress({ restEndTime: null });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentExercise) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Caricamento allenamento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1">{workout.sessionName}</h1>
            <p className="text-gray-600 text-sm">Esercizio {currentExerciseIndex + 1} di {workout.exercises.length}</p>
        </div>
        <Button onClick={onExit} variant="ghost" size="icon" className="bg-white/50 hover:bg-white/70 rounded-full">
          <X className="w-6 h-6 text-gray-500" />
        </Button>
      </motion.div>

      <Card className="p-4 glass-effect border-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">{currentExerciseIndex + 1}</div>
            <div className="text-xs text-gray-600">Esercizio</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-green-600">{currentSetIndex + 1}</div>
            <div className="text-xs text-gray-600">Serie</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-purple-600">{isResting ? formatTime(restTimer) : formatTime(restDuration)}</div>
            <div className="text-xs text-gray-600">Riposo</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-red-600 flex items-center justify-center">
              <Heart className="w-5 h-5 mr-1" />{heartRate || '--'}
            </div>
            <div className="text-xs text-gray-600">BPM</div>
          </div>
        </div>
      </Card>
      
      <AnimatePresence mode="wait">
        <motion.div
            key={currentExerciseIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="p-4 md:p-6 glass-effect border-0">
                <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{currentExercise.name}</h2>
                <p className="text-gray-600">Serie {currentSetIndex + 1} di {totalSets}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="text-center p-4 bg-white/50 rounded-lg flex flex-col justify-center items-center min-h-[6rem]">
                        <RepsDisplay text={repsForThisSet} />
                        <div className="text-sm text-gray-600 mt-1">Ripetizioni</div>
                    </div>
                </div>

                {!isResting && (
                  <div className="mb-6">
                    <Label htmlFor="weight-input" className="flex items-center mb-2 text-gray-700">
                      <Weight className="w-4 h-4 mr-2" />
                      Peso Utilizzato (Kg)
                    </Label>
                    <Input
                      id="weight-input"
                      type="number"
                      placeholder={"Es. 50"}
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      className="bg-white/70"
                    />
                  </div>
                )}

                {currentExercise.notes && (
                    <div className="flex items-start gap-2 p-3 bg-blue-100/60 rounded-lg text-sm text-blue-800 mb-6">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{currentExercise.notes}</p>
                    </div>
                )}
                
                <AnimatePresence>
                {isResting && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center mb-6">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                            <motion.circle 
                            cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray={283}
                            initial={{ strokeDashoffset: 283 * (1 - restTimer / restDuration) }}
                            animate={{ strokeDashoffset: 0 }}
                            transition={{ duration: restTimer, ease: "linear" }}
                            className="text-blue-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-800">{formatTime(restTimer)}</span>
                        </div>
                        </div>
                        <p className="text-lg font-medium text-blue-600">Tempo di riposo</p>
                    </motion.div>
                )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                {!isResting ? (
                    <Button onClick={completeSet} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600" size="lg">
                    <CheckCircle className="w-5 h-5 mr-2" /> Completa Serie
                    </Button>
                ) : (
                    <Button onClick={skipRest} variant="outline" size="lg">
                    <SkipForward className="w-5 h-5 mr-2" /> Salta Riposo
                    </Button>
                )}
                </div>
            </Card>
        </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center">
            <Button onClick={handlePrevExercise} variant="outline" disabled={currentExerciseIndex === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Prec.
            </Button>
            <Button onClick={() => handleNextExercise()} variant="outline">
                {currentExerciseIndex === workout.exercises.length - 1 ? 'Fine' : 'Succ.'}
                <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
        </div>
    </div>
  );
};

export default WorkoutSession;