import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Sparkles, Loader2, Zap, RefreshCw } from 'lucide-react';
import { cn } from "@/lib/utils";

const AiWorkoutPlanGenerator = ({ userData, updateUserData, onFinish, isDialogMode = false, isUpdateMode = false }) => {
  const [preferences, setPreferences] = useState({
    frequency: 3,
    objective: 'Costruzione',
    duration: 60,
    equipment: 'Sala Pesi',
    level: 'Intermedio'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const generatePlan = async () => {
    setIsLoading(true);
    toast({
      title: `🤖 ${isUpdateMode ? 'Aggiornamento' : 'Generazione'} del piano in corso...`,
      description: "L'IA sta creando il tuo piano di allenamento personalizzato. Potrebbe volerci un minuto.",
    });

    try {
      const { data: generatedData, error } = await supabase.functions.invoke('generate-workout-plan', {
        body: JSON.stringify({ userData, preferences }),
      });

      if (error) throw new Error(error.message);
      
      const newPlan = generatedData.plan;

      if (!newPlan || !newPlan.plan) {
         throw new Error("La risposta dell'IA non è nel formato corretto.");
      }

      await updateUserData({ ai_workout_plan: newPlan });

      toast({
        title: `✅ Piano di Allenamento ${isUpdateMode ? 'Aggiornato' : 'Generato'}!`,
        description: "Il tuo nuovo piano personalizzato è pronto. Buon allenamento!",
      });
      
      if (onFinish) onFinish();

    } catch (error) {
      console.error('Error generating workout plan:', error);
      toast({
        variant: 'destructive',
        title: `Errore ${isUpdateMode ? 'nell\'aggiornamento' : 'nella generazione'}`,
        description: `Si è verificato un errore: ${error.message}. Riprova più tardi.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Wrapper = isDialogMode ? 'div' : Card;
  const wrapperProps = isDialogMode ? {} : { className: "bg-white/60 backdrop-blur-lg border-0" };

  const content = (
    <>
      <CardHeader className="text-center pt-8 md:pt-10">
        {isUpdateMode ? <RefreshCw className="w-12 h-12 mx-auto text-blue-500" /> : <Zap className="w-12 h-12 mx-auto text-yellow-500" />}
        <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 mt-4">
          {isUpdateMode ? "Aggiorna il Tuo Piano di Allenamento" : "Crea il Tuo Piano di Allenamento con l'IA"}
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2 max-w-2xl mx-auto px-4">
          {isUpdateMode 
            ? "Modifica le tue preferenze e lascia che la nostra IA rigeneri il tuo programma."
            : "Nessun piano di allenamento trovato. Imposta le tue preferenze e lascia che la nostra IA crei un programma su misura per te."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 md:px-8 space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-3">
            <Label className="text-base md:text-lg font-semibold text-gray-700">Allenamenti a settimana: <span className="text-purple-600 font-bold">{preferences.frequency}</span></Label>
            <Slider value={[preferences.frequency]} onValueChange={([val]) => handlePreferenceChange('frequency', val)} min={2} max={5} step={1} />
          </div>
          <div className="space-y-3">
            <Label className="text-base md:text-lg font-semibold text-gray-700">Durata per sessione: <span className="text-purple-600 font-bold">{preferences.duration} min</span></Label>
            <Slider value={[preferences.duration]} onValueChange={([val]) => handlePreferenceChange('duration', val)} min={15} max={90} step={5} />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base md:text-lg font-semibold text-gray-700">Obiettivo Principale</Label>
          <RadioGroup value={preferences.objective} onValueChange={(val) => handlePreferenceChange('objective', val)} className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
            {['Costruzione', 'Dimagrimento', 'Mantenimento'].map(obj => (
              <div key={obj}>
                <RadioGroupItem value={obj} id={`obj-${obj}`} className="peer sr-only" />
                <Label htmlFor={`obj-${obj}`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 md:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all text-sm md:text-base">
                  {obj}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-base md:text-lg font-semibold text-gray-700">Attrezzatura Disponibile</Label>
          <RadioGroup value={preferences.equipment} onValueChange={(val) => handlePreferenceChange('equipment', val)} className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {['Corpo Libero', 'Circuito Corpo Libero', 'Sala Pesi', 'Calisthenics'].map(eq => (
              <div key={eq}>
                <RadioGroupItem value={eq} id={`eq-${eq}`} className="peer sr-only" />
                <Label htmlFor={`eq-${eq}`} className="flex items-center justify-center text-center rounded-md border-2 border-muted bg-popover p-3 md:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all text-sm md:text-base">
                  {eq}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-base md:text-lg font-semibold text-gray-700">Livello di Difficoltà</Label>
          <RadioGroup value={preferences.level} onValueChange={(val) => handlePreferenceChange('level', val)} className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
            {['Principiante', 'Intermedio', 'Avanzato'].map(lvl => (
              <div key={lvl}>
                <RadioGroupItem value={lvl} id={`lvl-${lvl}`} className="peer sr-only" />
                <Label htmlFor={`lvl-${lvl}`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-3 md:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all text-sm md:text-base">
                  {lvl}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

      </CardContent>
      <CardFooter className="px-6 md:px-8 pb-8 md:pb-10 pt-4">
        <Button onClick={generatePlan} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-base md:text-lg py-4 md:py-6">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 md:h-6 md:w-6 animate-spin" />
              {isUpdateMode ? 'Aggiornamento...' : 'Generazione...'}
            </>
          ) : (
            <>
              {isUpdateMode ? <RefreshCw className="mr-2 h-5 w-5 md:h-6 md:w-6" /> : <Sparkles className="mr-2 h-5 w-5 md:h-6 md:w-6" />}
              {isUpdateMode ? 'Aggiorna il Mio Piano' : 'Genera il Mio Piano'}
            </>
          )}
        </Button>
      </CardFooter>
    </>
  );

  if (isDialogMode) {
    return (
        <Wrapper {...wrapperProps}>
            {content}
        </Wrapper>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
       <Wrapper {...wrapperProps}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {content}
        </motion.div>
      </Wrapper>
    </div>
  );
};

export default AiWorkoutPlanGenerator;