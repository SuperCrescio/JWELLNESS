import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, BrainCircuit } from 'lucide-react';

const AlternativeMealDialog = ({ isOpen, onClose, originalMeal, mealType, onAccept }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [alternativeMeal, setAlternativeMeal] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      generateAlternative();
    } else {
      setAlternativeMeal(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const generateAlternative = async () => {
    setIsLoading(true);
    setError(null);
    setAlternativeMeal(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-alternative-meal', {
        body: {
          meal: {
            name: originalMeal.name,
            type: mealType,
            calories: originalMeal.calories,
            proteins: originalMeal.proteins,
            carbs: originalMeal.carbs,
            fats: originalMeal.fats,
          },
        },
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      setAlternativeMeal(data.alternative);
      toast({
        title: "✨ Alternativa generata!",
        description: "Ecco una nuova opzione per il tuo pasto.",
      });

    } catch (err) {
      console.error("Error generating alternative meal:", err);
      setError(`Impossibile generare l'alternativa. ${err.message}`);
      toast({
        variant: "destructive",
        title: "Errore AI",
        description: `Generazione fallita: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (alternativeMeal) {
      onAccept(alternativeMeal);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-purple-500" />
            Alternativa AI per {mealType}
          </DialogTitle>
          <DialogDescription>
            Generando un'alternativa per "{originalMeal.name}" con macro simili.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center space-y-2"
              >
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-purple-500" />
                <p className="text-sm text-gray-600">L'AI sta cucinando per te...</p>
              </motion.div>
            )}
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center text-red-600 bg-red-50 p-4 rounded-lg"
              >
                <p className="font-semibold">Oops! Qualcosa è andato storto.</p>
                <p className="text-xs mt-1">{error}</p>
              </motion.div>
            )}
            {alternativeMeal && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full space-y-3"
              >
                <h3 className="font-bold text-lg text-gray-800 text-center">{alternativeMeal.name}</h3>
                <div className="space-y-1">
                  {alternativeMeal.foods.map((food, index) => (
                    <div key={index} className="flex justify-between items-baseline text-sm text-gray-700 bg-gray-100/80 px-3 py-1.5 rounded-md">
                      <span className="flex-1 min-w-0 pr-2 truncate">{food.name}</span>
                      <span className="flex-shrink-0 border-b border-dotted border-gray-400 mx-1 flex-grow"></span>
                      <span className="font-medium text-gray-900 flex-shrink-0">{food.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-sm font-bold text-orange-600">{alternativeMeal.calories}</div>
                    <div className="text-xs text-gray-500">kcal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-600">{alternativeMeal.proteins}g</div>
                    <div className="text-xs text-gray-500">Prot.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-orange-500">{alternativeMeal.carbs}g</div>
                    <div className="text-xs text-gray-500">Carb.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-purple-600">{alternativeMeal.fats}g</div>
                    <div className="text-xs text-gray-500">Grassi</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          {alternativeMeal && (
            <Button onClick={handleAccept} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Usa questo pasto
            </Button>
          )}
          {isLoading && (
            <Button disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              In attesa...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlternativeMealDialog;