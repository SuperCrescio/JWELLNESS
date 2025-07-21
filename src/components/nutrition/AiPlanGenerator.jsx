import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';

const AiPlanGenerator = ({ userData, updateUserData, onFinish, isDialogMode = false, isUpdateMode = false }) => {
    const [selectedObjective, setSelectedObjective] = useState("mantenimento");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGeneratePlan = async () => {
        if (!userData.first_name || !userData.height_cm || !userData.weight_kg) {
            toast({
                variant: "destructive",
                title: "Dati utente incompleti",
                description: "Per favore, compila nome, altezza e peso nella pagina 'Utente' prima di generare un piano.",
            });
            return;
        }

        setIsLoading(true);
        toast({
            title: `✨ ${isUpdateMode ? 'Aggiornamento' : 'Generazione'} in corso...`,
            description: "L'AI sta creando il tuo piano personalizzato. Potrebbe volerci un minuto.",
        });

        const dayIdentifiers = [
            { key: 'ai_plan_day_a', name: 'Giorno A - Lunedì' },
            { key: 'ai_plan_day_b', name: 'Giorno B - Martedì' },
            { key: 'ai_plan_day_c', name: 'Giorno C - Mercoledì' },
            { key: 'ai_plan_day_d', name: 'Giorno D - Giovedì' },
            { key: 'ai_plan_day_e', name: 'Giorno E - Venerdì' },
            { key: 'ai_plan_day_f', name: 'Giorno F - Sabato' },
            { key: 'ai_plan_day_g', name: 'Giorno G - Domenica' },
        ];

        try {
            const generationPromises = dayIdentifiers.map(day =>
                supabase.functions.invoke('generate-nutrition-plan', {
                    body: {
                        userData: {
                            first_name: userData.first_name,
                            last_name: userData.last_name,
                            height_cm: userData.height_cm,
                            weight_kg: userData.weight_kg,
                        },
                        objective: selectedObjective,
                        dayIdentifier: day.name,
                    },
                })
            );

            const results = await Promise.all(generationPromises);

            const updates = {};
            let hasError = false;

            results.forEach((result, index) => {
                if (result.error) {
                    console.error(`Errore generazione ${dayIdentifiers[index].name}:`, result.error);
                    hasError = true;
                } else {
                    updates[dayIdentifiers[index].key] = result.data;
                }
            });

            if (hasError) {
                throw new Error("Una o più chiamate all'AI sono fallite.");
            }

            await updateUserData(updates);
            if (onFinish) {
                onFinish();
            }

            toast({
                title: `✅ Piano ${isUpdateMode ? 'Aggiornato' : 'Generato'}!`,
                description: `Il tuo nuovo piano alimentare AI è pronto e attivo.`,
            });

        } catch (error) {
            console.error("Errore durante la generazione del piano:", error);
            toast({
                variant: "destructive",
                title: `Errore di ${isUpdateMode ? 'Aggiornamento' : 'Generazione'}`,
                description: "Non è stato possibile creare il piano. Riprova più tardi.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const cardContent = (
      <Card className={isDialogMode ? "border-0 shadow-none bg-transparent" : "glass-effect border-0 text-center p-6"}>
          <CardHeader className="p-0 mb-4 text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center ring-4 ring-purple-500/20">
                  {isUpdateMode ? <RefreshCw className="w-8 h-8 text-white" /> : <Sparkles className="w-8 h-8 text-white" />}
              </div>
              <CardTitle className={`text-lg font-bold ${isDialogMode ? 'text-gray-800' : 'text-gray-800'}`}>
                {isUpdateMode ? "Aggiorna il Tuo Piano AI" : "Crea il Tuo Piano con l'AI"}
              </CardTitle>
              <CardDescription className={`text-xs pt-1 ${isDialogMode ? 'text-gray-600' : 'text-gray-600'}`}>
                {isUpdateMode ? "Modifica le tue preferenze e rigenera il tuo piano alimentare." : "Non hai un piano? Lascia che la nostra AI ne crei uno su misura per te."}
              </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
              <div>
                  <Label className={`text-sm font-semibold mb-3 block text-center ${isDialogMode ? 'text-gray-700' : 'text-gray-700'}`}>Seleziona il tuo obiettivo</Label>
                  <RadioGroup
                      defaultValue="mantenimento"
                      className="grid grid-cols-3 gap-2"
                      onValueChange={setSelectedObjective}
                      value={selectedObjective}
                  >
                      {["Dimagrimento", "Mantenimento", "Costruzione"].map((objective) => (
                          <div key={objective}>
                              <RadioGroupItem value={objective.toLowerCase()} id={objective.toLowerCase()} className="sr-only" />
                              <Label
                                  htmlFor={objective.toLowerCase()}
                                  className={`block text-center text-xs font-medium p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${selectedObjective === objective.toLowerCase()
                                          ? 'bg-purple-600 text-white border-purple-700 shadow-lg'
                                          : 'bg-white/50 border-white/60 hover:bg-white/80 text-black'
                                      }`}
                              >
                                  {objective}
                              </Label>
                          </div>
                      ))}
                  </RadioGroup>
              </div>
              <Button onClick={handleGeneratePlan} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold shadow-lg">
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Attendere...</> : (isUpdateMode ? "Aggiorna Piano" : "Genera Piano Alimentare")}
              </Button>
          </CardContent>
      </Card>
    );

    if(isDialogMode) {
      return cardContent;
    }

    return (
        <div className="space-y-2.5 max-w-md mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {cardContent}
            </motion.div>
        </div>
    );
};

export default AiPlanGenerator;