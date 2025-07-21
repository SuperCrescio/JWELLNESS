import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, Timer, Play } from 'lucide-react';

const WorkoutList = ({ workouts, onStartWorkout }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {workouts.map((workout, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 md:p-6 glass-effect border-0 card-hover">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2 text-blue-500" />
                  {workout.sessionName}
                </h3>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Timer className="w-4 h-4 mr-1" />
                  {workout.exercises.length} esercizi
                </p>
              </div>
              <Button
                onClick={() => onStartWorkout(workout)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full sm:w-auto"
              >
                <Play className="w-4 h-4 mr-1" />
                Inizia
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-sm">Esercizi principali:</h4>
              <div className="space-y-2">
                {workout.exercises.slice(0, 3).map((exercise, exerciseIndex) => (
                  <div
                    key={exerciseIndex}
                    className="flex items-center justify-between p-2 bg-white/50 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-800 truncate pr-2">
                      {exercise.name}
                    </span>
                    <div className="text-xs text-gray-600 flex-shrink-0">
                      {exercise.sets_reps}
                    </div>
                  </div>
                ))}
                {workout.exercises.length > 3 && (
                    <p className="text-xs text-center text-gray-500 pt-1">...e altri {workout.exercises.length - 3}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default WorkoutList;