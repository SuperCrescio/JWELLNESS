import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Apple, Clock, CheckCircle, ChevronDown, Flame, Pill, Zap, Sparkles } from 'lucide-react';
import AlternativeMealDialog from '@/components/nutrition/AlternativeMealDialog';

const MealCard = ({ meal, userData, updateUserData, animationDelay, selectedDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const { toast } = useToast();

  const getMealUniqueId = (m, date) => {
    if (!date || !m) return null;
    return `${date.toDateString()}-${m.name}-${m.time}`;
  };

  const getCompletedStatusForDate = (m, date) => {
    if (!userData.nutrition_progress || !date) return false;
    const mealId = getMealUniqueId(m, date);
    if (!mealId) return false;
    return userData.nutrition_progress.some(p => p.menuId === mealId);
  };

  const handleMealComplete = (mealToLog) => {
    if (!selectedDate) return;
    const menuId = getMealUniqueId(mealToLog, selectedDate);
    if (!menuId) return;

    const progress = {
      date: selectedDate.toISOString(),
      time: mealToLog.time,
      mealName: mealToLog.name,
      food_items: mealToLog.food_items,
      calories: mealToLog.calories,
      proteins: mealToLog.proteins,
      carbs: mealToLog.carbs,
      fats: mealToLog.fats,
      menuId: menuId, 
    };

    const existingProgressIndex = userData.nutrition_progress?.findIndex(
      p => p.menuId === menuId
    );

    let newProgress;
    if (existingProgressIndex > -1) {
      newProgress = userData.nutrition_progress.filter((p, index) => index !== existingProgressIndex);
      toast({
        title: "Pasto rimosso",
        description: `${mealToLog.name} (${mealToLog.time}) rimosso dal tracking di oggi.`,
      });
    } else {
      newProgress = [...(userData.nutrition_progress || []), progress];
      toast({
        title: "🎉 Pasto completato!",
        description: `${mealToLog.name} (${mealToLog.time}) registrato con successo.`,
      });
    }
    
    updateUserData({ nutrition_progress: newProgress });
  };

  const openAiDialog = () => {
    setIsAiDialogOpen(true);
  };

  const handleAcceptAlternative = (alternativeData) => {
      const alternativeMeal = {
        ...meal,
        name: alternativeData.name,
        food_items: alternativeData.foods,
        calories: alternativeData.calories,
        proteins: alternativeData.proteins,
        carbs: alternativeData.carbs,
        fats: alternativeData.fats,
    };
    handleMealComplete(alternativeMeal);
    setIsAiDialogOpen(false);
  };

  if (!meal) {
    return null; 
  }

  const isCompleted = getCompletedStatusForDate(meal, selectedDate);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animationDelay }}
      >
        <Card className="p-2 glass-effect border-0 card-hover overflow-hidden">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-gray-800 flex items-center">
                <Apple className="w-3 h-3 mr-1.5 text-green-500 flex-shrink-0" />
                <span className="truncate">{meal.name}</span>
              </h3>
              <div className="flex items-center text-[10px] text-gray-600 mt-0.5 gap-1.5">
                <div className="flex items-center">
                  <Clock className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" />
                  <span>{meal.time || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <Flame className="w-2.5 h-2.5 mr-0.5 text-orange-500 flex-shrink-0" />
                  <span>{meal.calories || '--'} kcal</span>
                </div>
              </div>
            </div>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="ml-2 flex-shrink-0">
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </motion.div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem' }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5">
                  <div className={`p-1.5 rounded-md transition-all duration-300 ${isCompleted ? 'bg-green-100/50 ring-1 ring-green-200' : 'bg-white/50'}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium text-gray-800 flex items-center text-[11px] flex-1 min-w-0">
                        <Zap className="w-2.5 h-2.5 mr-1 text-yellow-500 flex-shrink-0" />
                        <span className="truncate">{meal.name}</span>
                      </h4>
                      <Button
                        onClick={() => handleMealComplete(meal)}
                        variant={isCompleted ? "default" : "outline"}
                        size="sm"
                        className={`text-[10px] px-1 py-0.5 h-auto rounded ${isCompleted 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'border-green-500 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <CheckCircle className="w-2 h-2 mr-1" />
                        <span>{isCompleted ? 'Fatto' : 'Completa'}</span>
                      </Button>
                    </div>
                    
                    {meal.food_items && meal.food_items.length > 0 && (
                      <div className="space-y-0.5 mb-1">
                        {meal.food_items.map((food, foodIndex) => (
                          <div key={foodIndex} className="flex justify-between items-start text-[10px] text-gray-700 bg-gray-100/60 px-1 py-0.5 rounded">
                              <span className="flex-1 min-w-0 pr-1 break-words">{food.name}</span>
                              <span className="flex-shrink-0 border-b border-dotted border-gray-400 mx-1 mt-[5px]"></span>
                              <span className="font-medium text-gray-800 flex-shrink-0">{food.quantity || 'q.b.'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {meal.supplements && (
                       <div className="text-[10px] text-gray-600 bg-blue-100/60 p-1 rounded-md mb-1 flex items-start">
                         <Pill className="w-2.5 h-2.5 mr-1 mt-0.5 text-blue-500 flex-shrink-0" />
                         <div className="min-w-0">
                           <span className="font-semibold text-blue-800">Suppl:</span> {meal.supplements}
                         </div>
                       </div>
                    )}

                    <div className="grid grid-cols-4 gap-0.5 pt-1 border-t border-gray-200/80">
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-orange-600">{meal.calories || '--'}</div>
                        <div className="text-[8px] text-gray-500">kcal</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-medium text-blue-600">{meal.proteins || '--'}g</div>
                        <div className="text-[8px] text-gray-500">Prot.</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-medium text-orange-500">{meal.carbs || '--'}g</div>
                        <div className="text-[8px] text-gray-500">Carb.</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-medium text-purple-600">{meal.fats || '--'}g</div>
                        <div className="text-[8px] text-gray-500">Grassi</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Button
                        onClick={openAiDialog}
                        variant="outline"
                        size="sm"
                        className="w-full text-[10px] h-auto py-1"
                      >
                        <Sparkles className="w-3 h-3 mr-1.5 text-purple-500" />
                        Alternativa AI
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
      <AlternativeMealDialog
        isOpen={isAiDialogOpen}
        onClose={() => setIsAiDialogOpen(false)}
        originalMeal={{
            name: meal.name,
            calories: meal.calories,
            proteins: meal.proteins,
            carbs: meal.carbs,
            fats: meal.fats,
        }}
        mealType={meal.name}
        onAccept={handleAcceptAlternative}
      />
    </>
  );
};

export default MealCard;