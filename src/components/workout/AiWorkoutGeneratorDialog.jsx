import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const AiWorkoutGeneratorDialog = ({ isOpen, onClose, onWorkoutGenerated }) => {
  const [duration, setDuration] = useState(45);
  const [equipment, setEquipment] = useState('bodyweight');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateWorkout = async () => {
    setIsLoading(true);
    toast({
      title: '🤖 Generazione in corso...',
      description: "L'IA sta creando il tuo allenamento personalizzato. Attendi un momento.",
    });

    try {
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: JSON.stringify({ duration, equipment }),
      });

      if (error) throw error;

      if (data && data.session) {
        onWorkoutGenerated(data.session);
        toast({
          title: '✅ Allenamento generato!',
          description: 'La tua sessione è pronta. Buon allenamento!',
        });
        onClose();
      } else {
        throw new Error('Risposta non valida dalla funzione AI.');
      }
    } catch (error) {
      console.error('Error generating workout:', error);
      toast({
        variant: 'destructive',
        title: 'Errore nella generazione',
        description: "Impossibile creare l'allenamento. Riprova più tardi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
            Genera Allenamento con AI
          </DialogTitle>
          <DialogDescription>
            Imposta le tue preferenze e lascia che l'IA crei un allenamento su misura per te.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="duration">Durata (minuti)</Label>
              <span className="font-bold text-purple-600">{duration} min</span>
            </div>
            <Slider
              id="duration"
              defaultValue={[45]}
              value={[duration]}
              min={15}
              max={90}
              step={5}
              onValueChange={(value) => setDuration(value[0])}
            />
          </div>
          <div className="space-y-3">
            <Label>Attrezzatura</Label>
            <RadioGroup
              defaultValue="bodyweight"
              value={equipment}
              onValueChange={setEquipment}
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem value="bodyweight" id="bodyweight" className="peer sr-only" />
                <Label
                  htmlFor="bodyweight"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  Corpo Libero
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dumbbells" id="dumbbells" className="peer sr-only" />
                <Label
                  htmlFor="dumbbells"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  Manubri
                </Label>
              </div>
              <div>
                <RadioGroupItem value="full_gym" id="full_gym" className="peer sr-only" />
                <Label
                  htmlFor="full_gym"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  Pesi
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerateWorkout} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generazione...
              </>
            ) : (
              'Genera Allenamento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AiWorkoutGeneratorDialog;