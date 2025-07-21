import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { BrainCircuit, Headphones, Play, Pause, Volume2, Loader2, StopCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import useBinauralBeat from '@/hooks/useBinauralBeat';

const Meditation = ({ userData, updateUserData }) => {
  const [duration, setDuration] = useState(15);
  const [objective, setObjective] = useState('Meditazione');
  const [isLoading, setIsLoading] = useState(false);
  const [trackData, setTrackData] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const { toast } = useToast();

  const {
    play,
    pause,
    stop,
    isPlaying,
    setVolume,
    currentTime,
    totalDuration,
    cleanup,
  } = useBinauralBeat();

  const handleSessionEnd = useCallback(async (finalTime) => {
    if (!trackData || !sessionActive) return;

    const sessionRecord = {
      obiettivo: trackData.theme,
      timestamp: new Date().toISOString(),
      durata_effettiva: Math.round(finalTime / 60),
      durata_impostata: trackData.duration,
      giorno_settimana: new Date().toLocaleDateString('it-IT', { weekday: 'long' }),
    };

    const currentSessions = userData?.meditation_sessions || [];
    const updatedSessions = [...currentSessions, sessionRecord];
    
    await updateUserData({ meditation_sessions: updatedSessions });

    toast({
      title: 'Sessione Completata!',
      description: `Hai completato ${sessionRecord.durata_effettiva} minuti di ${trackData.theme}.`,
    });

    setTrackData(null);
    setSessionActive(false);
    cleanup();
  }, [trackData, sessionActive, userData, updateUserData, toast, cleanup]);


  useEffect(() => {
    if (isPlaying && totalDuration > 0 && currentTime >= totalDuration) {
        stop();
        handleSessionEnd(totalDuration);
    }
  }, [currentTime, totalDuration, isPlaying, handleSessionEnd, stop]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleGenerateTrack = async () => {
    setIsLoading(true);
    if (sessionActive) {
      cleanup();
      setSessionActive(false);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-meditation-track', {
        body: { theme: objective, duration: duration },
      });

      if (error) throw error;

      const fullTrackData = {
        ...data,
        theme: objective,
        duration: duration,
      };

      setTrackData(fullTrackData);
      setSessionActive(true);
      toast({
        title: 'Traccia Generata',
        description: 'Buon ascolto!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Errore Generazione Traccia',
        description: error.message || 'Impossibile generare la traccia audio.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const objectives = [
    { id: 'Meditazione', label: 'Meditazione', description: 'Onde Theta (4-8Hz) per profondo rilassamento e introspezione.' },
    { id: 'Rilassamento', label: 'Rilassamento', description: 'Onde Alfa (8-12Hz) per calma, riduzione stress e creatività.' },
    { id: 'Focus', label: 'Focus', description: 'Onde Beta (13-30Hz) per concentrazione, attenzione e problem-solving.' },
  ];

  const handlePlay = () => {
    if (trackData) {
      play(trackData.script, duration * 60);
    }
  };

  const handlePause = () => {
    pause();
  };

  const handleStop = () => {
    stop();
    handleSessionEnd(currentTime);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
          <BrainCircuit className="w-8 h-8 mr-3 text-purple-600" />
          Meditazione Guidata
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Crea la tua sessione di suoni binaurali per migliorare il tuo stato mentale.
        </p>
      </motion.div>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex items-start space-x-4">
          <Headphones className="w-10 h-10 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-blue-800">Preparati alla sessione</h4>
            <p className="text-sm text-blue-700">
              Prima di cominciare indossa le cuffie. Trova un posto tranquillo e pacifico, privo di distrazioni per godere al massimo dell'esperienza.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <AnimatePresence>
        {!sessionActive && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-effect border-0">
              <CardHeader>
                <CardTitle>Configura la tua Sessione</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <Label className="text-lg font-medium">Obiettivo</Label>
                  <RadioGroup value={objective} onValueChange={setObjective} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {objectives.map((item) => (
                      <motion.div key={item.id} whileHover={{ y: -5 }}>
                        <Label htmlFor={item.id} className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${objective === item.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`}>
                          <RadioGroupItem value={item.id} id={item.id} className="sr-only" />
                          <span className="font-bold text-center">{item.label}</span>
                          <span className="text-xs text-center text-gray-500 mt-2">{item.description}</span>
                        </Label>
                      </motion.div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="duration" className="text-lg font-medium">Durata: <span className="font-bold text-purple-600">{duration} minuti</span></Label>
                  <Slider
                    id="duration"
                    min={5}
                    max={60}
                    step={5}
                    value={[duration]}
                    onValueChange={(value) => setDuration(value[0])}
                    className="mt-4"
                  />
                </div>

                <div className="text-center">
                  <Button onClick={handleGenerateTrack} disabled={isLoading} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    Inizia Sessione
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sessionActive && trackData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="glass-effect border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>In Riproduzione: {trackData.theme}</span>
                  <span className="text-sm font-normal">{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}></div>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  {!isPlaying ? (
                     <Button onClick={handlePlay} variant="ghost" size="icon" className="w-16 h-16 rounded-full bg-white/50" disabled={!trackData.script}>
                        <Play className="w-8 h-8 text-purple-600" />
                     </Button>
                  ) : (
                    <>
                      <Button onClick={handlePause} variant="ghost" size="icon" className="w-16 h-16 rounded-full bg-white/50">
                        <Pause className="w-8 h-8 text-purple-600" />
                      </Button>
                      <Button onClick={handleStop} variant="destructive" size="icon" className="w-16 h-16 rounded-full">
                        <StopCircle className="w-8 h-8" />
                      </Button>
                    </>
                  )}
                 
                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-5 h-5 text-gray-600" />
                    <Slider
                      defaultValue={[1]}
                      max={1}
                      step={0.01}
                      onValueChange={(value) => setVolume(value[0])}
                      className="w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Meditation;