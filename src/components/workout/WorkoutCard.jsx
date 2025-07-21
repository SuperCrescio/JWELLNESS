import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Target, Play, Repeat, Clock } from 'lucide-react';

const WorkoutCard = ({ session, onStartWorkout, animationDelay }) => {
  if (!session || !session.exercises) {
    return null;
  }
  
  const totalSets = session.exercises.reduce((acc, ex) => {
    const sets = ex.sets ? Number(ex.sets) : 0;
    return acc + (isNaN(sets) ? 0 : sets);
  }, 0);

  const estimatedDuration = session.estimatedDurationMinutes || session.totalEstimatedTimeMinutes || 0;

  const sessionName = session.name || session.sessionName || "Allenamento senza nome";


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
    >
      <Card className="p-4 glass-effect border-0 card-hover flex flex-col h-full">
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
                <Dumbbell className="w-6 h-6 text-blue-500" />
            </div>
            <div>
                 <h3 className="text-lg font-semibold text-gray-800">
                    {sessionName}
                </h3>
                {session.focus && (
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Target className="w-4 h-4 mr-1 text-purple-500" />
                        {session.focus}
                    </p>
                )}
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <h4 className="font-medium text-gray-700 text-sm">Esercizi principali:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {session.exercises.slice(0, 5).map((exercise, exerciseIndex) => (
                <div
                  key={exerciseIndex}
                  className="flex items-center justify-between p-2 bg-white/50 rounded-lg text-sm"
                >
                  <span className="font-medium text-gray-800 truncate pr-2">
                    {exercise.name}
                  </span>
                  <div className="text-xs text-gray-600 font-mono flex-shrink-0">
                    {exercise.sets}x{exercise.reps} {exercise.rest && `(${exercise.rest}")`}
                  </div>
                </div>
              ))}
              {session.exercises.length > 5 && (
                <p className="text-xs text-center text-gray-500 pt-1">...e altri {session.exercises.length - 5}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-200/60">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4" />
                    <span>{session.exercises.length} esercizi</span>
                </div>
                 <div className="flex items-center gap-1.5">
                    <Repeat className="w-4 h-4" />
                    <span>~{totalSets} serie</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>~{estimatedDuration} min</span>
                </div>
            </div>
            <Button
                onClick={() => onStartWorkout({ ...session, sessionName })}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
                <Play className="w-4 h-4 mr-2" />
                Inizia Allenamento
            </Button>
        </div>

      </Card>
    </motion.div>
  );
};

export default WorkoutCard;