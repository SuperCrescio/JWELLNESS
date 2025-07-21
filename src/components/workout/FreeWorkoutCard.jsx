import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Play } from 'lucide-react';

const FreeWorkoutCard = ({ onStartWorkout, animationDelay }) => {

  const handleStartFreeWorkout = () => {
    const freeWorkout = {
      sessionName: 'Allenamento Libero',
      exercises: [],
    };
    onStartWorkout(freeWorkout);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className="h-full"
    >
      <Card className="p-4 bg-gray-100/80 backdrop-blur-sm border-0 card-hover flex flex-col h-full">
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-200 p-3 rounded-full">
              <Dumbbell className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Allenamento Libero</h3>
              <p className="text-sm text-gray-600 flex items-center mt-1">Inizia una sessione vuota</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Traccia un allenamento non pianificato iniziando una sessione vuota.
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-200/60">
          <Button onClick={handleStartFreeWorkout} variant="outline" className="w-full bg-white/50 hover:bg-white/70">
            <Play className="w-4 h-4 mr-2" />
            Inizia Sessione Vuota
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default FreeWorkoutCard;