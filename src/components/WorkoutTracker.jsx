import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { ServerCrash, Sparkles, RefreshCw, FileText, BrainCircuit, X } from 'lucide-react';
import WorkoutSession from '@/components/workout/WorkoutSession';
import FreeWorkoutSession from '@/components/workout/FreeWorkoutSession';
import WorkoutCard from '@/components/workout/WorkoutCard';
import RunningCard from '@/components/workout/RunningCard';
import FreeWorkoutCard from '@/components/workout/FreeWorkoutCard.jsx';
import RunningSession from '@/components/workout/RunningSession';
import { Card } from '@/components/ui/card';
import AiWorkoutPlanGenerator from '@/components/workout/AiWorkoutPlanGenerator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';

const WorkoutTracker = ({ userData, updateUserData }) => {
  const { session: workoutSession, setSession, clearSession } = useWorkoutSession();
  const [showPlanChoice, setShowPlanChoice] = useState(false);
  const [planChoice, setPlanChoice] = useState(null);
  const [isGeneratingAiPlan, setIsGeneratingAiPlan] = useState(false);
  const [isUpdatingAiPlan, setIsUpdatingAiPlan] = useState(false);
  const { toast } = useToast();

  const isModalOpen = isGeneratingAiPlan || isUpdatingAiPlan;

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);


  const hasFilePlan = useMemo(() => {
    const sessions = userData?.workout_plan?.plan?.sessions;
    return Array.isArray(sessions) && sessions.length > 0;
  }, [userData?.workout_plan]);

  const hasAiPlan = useMemo(() => {
    const sessions = userData?.ai_workout_plan?.plan?.sessions;
    return Array.isArray(sessions) && sessions.length > 0;
  }, [userData?.ai_workout_plan]);

  const activePlanType = useMemo(() => {
    if (planChoice) return planChoice;
    if (hasFilePlan && !hasAiPlan) return 'file';
    if (!hasFilePlan && hasAiPlan) return 'ai';
    return null;
  }, [planChoice, hasFilePlan, hasAiPlan]);

  const workoutPlanData = useMemo(() => {
    if (activePlanType === 'ai') return userData.ai_workout_plan.plan;
    if (activePlanType === 'file') return userData.workout_plan.plan;
    return null;
  }, [activePlanType, userData.ai_workout_plan, userData.workout_plan]);
  
  const sessions = workoutPlanData?.sessions;
  const hasActivePlan = Array.isArray(sessions) && sessions.length > 0;

  useEffect(() => {
    if (hasFilePlan && hasAiPlan && !planChoice && !workoutSession.isActive) {
      setShowPlanChoice(true);
    } else {
      setShowPlanChoice(false);
    }
  }, [hasFilePlan, hasAiPlan, planChoice, workoutSession.isActive]);

  const handlePlanSelect = (choice) => {
    setPlanChoice(choice);
    setShowPlanChoice(false);
  };
  
  const handleAiPlanFinished = () => {
    setIsGeneratingAiPlan(false);
    setIsUpdatingAiPlan(false);
    setPlanChoice('ai');
  };

  const handlePlanChoiceOpenChange = (isOpen) => {
    if (!isOpen) {
        if (hasFilePlan) {
            handlePlanSelect('file');
        } else if (hasAiPlan) {
            handlePlanSelect('ai');
        } else {
            setShowPlanChoice(false);
        }
    } else {
        setShowPlanChoice(true);
    }
  };

  if (!userData) {
    return (
        <Card className="p-6 text-center glass-effect border-0">
            <ServerCrash className="w-12 h-12 mx-auto mb-4 text-red-500"/>
            <h2 className="text-xl font-bold text-gray-800">Dati non disponibili</h2>
            <p className="text-gray-600">Impossibile caricare i dati per il workout. Riprova più tardi.</p>
        </Card>
    );
  }

  const handleProgressUpdate = async (updates) => {
    await updateUserData(updates);
  };
  
  const startWorkout = (type, data) => {
    let sessionData = data;
    if (type === 'run') {
      sessionData = { ...data, sessionName: 'Corsa' };
    }

    const sessionToStart = {
        isActive: true,
        workoutType: type,
        sessionData: sessionData,
        startTime: new Date().toISOString(),
        progress: type === 'workout' ? { currentExerciseIndex: 0, currentSetIndex: 0, completedExercisesData: [] } : {},
    };
    setSession(sessionToStart);
    toast({
      title: "💪 Allenamento iniziato!",
      description: `${sessionData.sessionName || 'Sessione'} - Buon allenamento!`,
    });
  };

  const endWorkout = () => {
    clearSession();
  };

  const completeWorkout = (workoutData) => {
    const workoutProgress = {
      date: new Date().toISOString(),
      workoutName: workoutSession.sessionData.sessionName,
      exercises: workoutData.completedExercises,
      duration: workoutData.duration,
      avgHeartRate: workoutData.avgHeartRate
    };

    const newProgress = [...(userData.workout_progress || []), workoutProgress];
    handleProgressUpdate({ workout_progress: newProgress });
    endWorkout();

    toast({
      title: "🏆 Allenamento completato!",
      description: "Ottimo lavoro! I tuoi progressi sono stati salvati.",
    });
  };
  
  const completeFreeWorkout = (workoutData) => {
    const workoutProgress = {
      date: new Date().toISOString(),
      workoutName: 'Allenamento Libero',
      exercises: [],
      duration: workoutData.duration,
    };

    const newProgress = [...(userData.workout_progress || []), workoutProgress];
    handleProgressUpdate({ workout_progress: newProgress });
    endWorkout();

    toast({
      title: "🏆 Allenamento completato!",
      description: "Ottimo lavoro! I tuoi progressi sono stati salvati.",
    });
  };

  const completeRun = (runData) => {
    const runProgress = {
      date: new Date().toISOString(),
      workoutName: 'Corsa',
      type: 'running',
      details: {
        distance: runData.distance,
        calories: runData.calories,
      },
      duration: runData.duration,
    };
    
    const newProgress = [...(userData.workout_progress || []), runProgress];
    handleProgressUpdate({ workout_progress: newProgress });
    endWorkout();

    toast({
      title: "🎉 Corsa completata!",
      description: "I tuoi progressi sono stati salvati.",
    });
  };
  
  if (workoutSession.isActive) {
    switch (workoutSession.workoutType) {
        case 'workout':
            return <WorkoutSession onComplete={completeWorkout} onExit={endWorkout} />;
        case 'free-workout':
            return <FreeWorkoutSession onComplete={completeFreeWorkout} onExit={endWorkout} />;
        case 'run':
            return <RunningSession onComplete={completeRun} onExit={endWorkout} />;
        default:
            endWorkout();
            return null;
    }
  }

  if (showPlanChoice) {
    return (
      <Dialog open={showPlanChoice} onOpenChange={handlePlanChoiceOpenChange}>
        <DialogContent>
          <DialogHeader className="text-center">
            <DialogTitle className="text-gray-800">Scegli il tuo piano</DialogTitle>
            <DialogDescription className="text-gray-600">
              Hai due piani disponibili. Quale vuoi usare oggi?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Button onClick={() => handlePlanSelect('file')} variant="outline" className="bg-white/80 hover:bg-white text-black py-6 text-base">
              <FileText className="mr-2 h-5 w-5" /> Piano File
            </Button>
            <Button onClick={() => handlePlanSelect('ai')} className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-6 text-base">
              <BrainCircuit className="mr-2 h-5 w-5" /> Piano AI
            </Button>
          </div>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
  }

  if (!hasFilePlan && !hasAiPlan) {
    return <AiWorkoutPlanGenerator userData={userData} updateUserData={updateUserData} onFinish={handleAiPlanFinished} />;
  }
  
  if (!hasActivePlan) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-lg font-semibold text-gray-700 mb-4">In attesa della tua scelta del piano...</p>
        {hasFilePlan && !hasAiPlan && (
          <Button 
            onClick={() => setIsGeneratingAiPlan(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Genera Piano con AI
          </Button>
        )}
      </div>
    );
  }

  const { planName, objective } = workoutPlanData;

  return (
    <div className="space-y-6">
      <Dialog open={isModalOpen} onOpenChange={isUpdatingAiPlan ? setIsUpdatingAiPlan : setIsGeneratingAiPlan}>
        <DialogContent className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto p-0 sm:rounded-2xl">
          <AiWorkoutPlanGenerator 
            userData={userData} 
            updateUserData={updateUserData} 
            onFinish={handleAiPlanFinished}
            isDialogMode={true}
            isUpdateMode={isUpdatingAiPlan}
          />
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          {planName || 'Il Tuo Piano di Allenamento'}
        </h1>
        <p className="text-gray-600">
          Obiettivo: <span className="font-semibold text-purple-600">{objective || 'Non specificato'}</span>
        </p>
      </motion.div>

      <AnimatePresence>
        <div className="flex gap-4 mb-4">
          {hasFilePlan && !hasAiPlan && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-grow"
            >
              <Button 
                onClick={() => setIsGeneratingAiPlan(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Genera Piano AI
              </Button>
            </motion.div>
          )}
          {activePlanType === 'ai' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-grow"
            >
              <Button 
                onClick={() => setIsUpdatingAiPlan(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Aggiorna Piano AI
              </Button>
            </motion.div>
          )}
        </div>
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
            {sessions.map((session, index) => (
              <WorkoutCard 
                key={session.sessionName || index} 
                session={session} 
                onStartWorkout={(data) => startWorkout('workout', data)}
                animationDelay={index * 0.1}
              />
            ))}
            <RunningCard onStartRun={(data) => startWorkout('run', data)} animationDelay={sessions.length * 0.1} />
            <FreeWorkoutCard onStartWorkout={(data) => startWorkout('free-workout', data)} animationDelay={(sessions.length + 1) * 0.1} />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkoutTracker;