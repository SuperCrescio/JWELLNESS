import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { BrainCircuit, FileText, ServerCrash, X, PlayCircle, RefreshCw } from 'lucide-react';
import MealCard from '@/components/nutrition/MealCard';
import WeekNavigator from '@/components/nutrition/WeekNavigator';
import AiPlanGenerator from '@/components/nutrition/AiPlanGenerator';
import DailyStats from '@/components/nutrition/DailyStats';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';

const NutritionTracker = ({ userData, updateUserData }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { toast } = useToast();
    const navigate = useNavigate();
    const { session: workoutSession } = useWorkoutSession();

    const [planChoice, setPlanChoice] = useState(null);
    const [showPlanChoice, setShowPlanChoice] = useState(false);
    const [isGeneratingAiPlan, setIsGeneratingAiPlan] = useState(false);
    const [isUpdatingAiPlan, setIsUpdatingAiPlan] = useState(false);

    const getWeekDays = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });
    };

    const [weekDays, setWeekDays] = useState(getWeekDays(currentDate));
    const [selectedDay, setSelectedDay] = useState(currentDate.toDateString());

    const changeWeek = (amount) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + amount * 7);
        setCurrentDate(newDate);
        const newWeekDays = getWeekDays(newDate);
        setWeekDays(newWeekDays);
        if (amount !== 0) {
            setSelectedDay(newWeekDays[newDate.getDay()].toDateString());
        }
    };
    
    const currentDayIndex = useMemo(() => {
        const date = new Date(selectedDay);
        return date.getDay();
    }, [selectedDay]);

    const hasFilePlan = useMemo(() => {
        const dayKey = `plan_day_${String.fromCharCode(97 + currentDayIndex)}`;
        return userData && userData[dayKey] && userData[dayKey].meals && userData[dayKey].meals.length > 0;
    }, [userData, currentDayIndex]);

    const hasAiPlan = useMemo(() => {
        const dayKey = `ai_plan_day_${String.fromCharCode(97 + currentDayIndex)}`;
        return userData && userData[dayKey] && userData[dayKey].meals && userData[dayKey].meals.length > 0;
    }, [userData, currentDayIndex]);
    
    const activePlanType = useMemo(() => {
        if (planChoice) return planChoice;
        if (hasFilePlan && !hasAiPlan) return 'file';
        if (!hasFilePlan && hasAiPlan) return 'ai';
        return null;
    }, [planChoice, hasFilePlan, hasAiPlan]);

    const dayKey = activePlanType === 'ai' 
        ? `ai_plan_day_${String.fromCharCode(97 + currentDayIndex)}` 
        : `plan_day_${String.fromCharCode(97 + currentDayIndex)}`;
    
    const todaysPlan = userData ? userData[dayKey] : null;

    const dayStats = useMemo(() => {
      const stats = {
        consumedCalories: 0,
        consumedProteins: 0,
        consumedCarbs: 0,
        consumedFats: 0,
        mealsCount: 0,
      };

      if (!userData.nutrition_progress) {
        return stats;
      }
      
      const currentSelectedDate = new Date(selectedDay).toDateString();

      const completedMealsForDay = userData.nutrition_progress.filter(
        (p) => new Date(p.date).toDateString() === currentSelectedDate
      );

      completedMealsForDay.forEach((meal) => {
        stats.consumedCalories += meal.calories || 0;
        stats.consumedProteins += meal.proteins || 0;
        stats.consumedCarbs += meal.carbs || 0;
        stats.consumedFats += meal.fats || 0;
      });

      stats.mealsCount = completedMealsForDay.length;

      return stats;
    }, [userData.nutrition_progress, selectedDay]);

    React.useEffect(() => {
        if (hasFilePlan && hasAiPlan && !planChoice) {
            setShowPlanChoice(true);
        } else {
            setShowPlanChoice(false);
        }
    }, [hasFilePlan, hasAiPlan, planChoice, currentDayIndex]);
    
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

    const allMealsDone = useMemo(() => {
      if (!todaysPlan || !todaysPlan.meals) return false;
      return todaysPlan.meals.every(meal =>
        userData.nutrition_progress?.some(p => 
          p.menuId === `${new Date(selectedDay).toDateString()}-${meal.name}-${meal.time}`
        )
      );
    }, [todaysPlan, userData.nutrition_progress, selectedDay]);

    if (!userData) {
        return <Card className="p-6 text-center glass-effect border-0">
            <ServerCrash className="w-12 h-12 mx-auto mb-4 text-red-500"/>
            <h2 className="text-xl font-bold text-gray-800">Dati non disponibili</h2>
            <p className="text-gray-600">Impossibile caricare i dati per l'alimentazione. Riprova più tardi.</p>
        </Card>
    }

    if (workoutSession.isActive) {
      return (
        <Card className="p-6 text-center glass-effect border-0 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sessione di allenamento in corso</h2>
          <p className="text-gray-600 mb-6">Concentrati sul tuo workout! Potrai accedere al piano alimentare al termine della sessione.</p>
          <Button onClick={() => navigate('/workout')}>
            <PlayCircle className="mr-2 h-5 w-5" /> Riprendi Allenamento
          </Button>
        </Card>
      );
    }
    
    if (showPlanChoice) {
        return (
          <Dialog open={showPlanChoice} onOpenChange={handlePlanChoiceOpenChange}>
            <DialogContent>
              <DialogHeader className="text-center">
                <DialogTitle className="text-gray-800">Scegli il tuo piano</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Hai due piani alimentari per oggi. Quale vuoi seguire?
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
        return <AiPlanGenerator userData={userData} updateUserData={updateUserData} onFinish={handleAiPlanFinished} />;
    }

    return (
        <div className="space-y-6">
            <Dialog open={isGeneratingAiPlan || isUpdatingAiPlan} onOpenChange={isUpdatingAiPlan ? setIsUpdatingAiPlan : setIsGeneratingAiPlan}>
                <DialogContent className="max-w-md">
                    <AiPlanGenerator 
                        userData={userData} 
                        updateUserData={updateUserData} 
                        onFinish={handleAiPlanFinished}
                        isDialogMode={true}
                        isUpdateMode={isUpdatingAiPlan}
                    />
                </DialogContent>
            </Dialog>

            <WeekNavigator 
                weekDays={weekDays} 
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                changeWeek={changeWeek}
            />

            {activePlanType === 'ai' && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
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

            {todaysPlan && todaysPlan.meals ? (
                <>
                    <DailyStats dayStats={dayStats} />
                    <AnimatePresence>
                        {allMealsDone && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="p-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl text-center shadow-lg"
                            >
                                <h3 className="font-bold text-lg">Complimenti!</h3>
                                <p>Hai completato tutti i pasti di oggi. Ottimo lavoro!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {todaysPlan.meals.map((meal, index) => (
                            <MealCard 
                                key={meal.name + meal.time + index} 
                                meal={meal}
                                animationDelay={index * 0.1}
                                userData={userData}
                                updateUserData={updateUserData}
                                selectedDate={new Date(selectedDay)}
                            />
                        ))}
                    </div>
                </>
            ) : (
                 <Card className="p-6 text-center glass-effect border-0">
                    <h2 className="text-xl font-bold text-gray-800">Nessun piano per oggi</h2>
                    <p className="text-gray-600">Non hai un piano alimentare per questo giorno.</p>
                     {!hasAiPlan && (
                        <Button 
                            onClick={() => setIsGeneratingAiPlan(true)}
                            className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
                        >
                            <BrainCircuit className="mr-2 h-4 w-4" /> Genera piano con AI
                        </Button>
                    )}
                </Card>
            )}
        </div>
    );
};

export default NutritionTracker;