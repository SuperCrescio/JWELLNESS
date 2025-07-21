import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Wind, Play, Clock } from 'lucide-react';

const RunningCard = ({ onStartRun, animationDelay }) => {
  const [duration, setDuration] = useState(30);

  const handleStartRunning = () => {
    if (onStartRun) {
      onStartRun({ duration });
    }
  };

  const formatTime = minutes => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    let timeString = '';
    if (h > 0) timeString += `${h}h `;
    if (m > 0) timeString += `${m}min`;
    return timeString.trim();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: animationDelay }}
    >
      <Card className="p-4 glass-effect border-0 card-hover flex flex-col h-full">
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-full">
                <Wind className="w-6 h-6 text-green-500" />
            </div>
            <div>
                 <h3 className="text-lg font-semibold text-gray-800">Corsa Libera</h3>
                <p className="text-sm text-gray-600 flex items-center mt-1">Allenamento Cardio Extra Session</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-700 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    Durata
                </h4>
                <span className="font-bold text-lg text-green-600">{formatTime(duration)}</span>
            </div>
            <Slider 
              defaultValue={[30]} 
              value={[duration]} 
              min={10} 
              max={120} 
              step={1} 
              onValueChange={value => setDuration(value[0])} 
              className="[&>span:first-child]:bg-green-500 [&>span>span]:bg-green-600 [&>span>span]:border-green-700" 
            />
            <div className="flex justify-between text-xs text-gray-500">
                <span>10 min</span>
                <span>2 ore</span>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-200/60">
            <Button onClick={handleStartRunning} className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                <Play className="w-4 h-4 mr-2" />
                Inizia Corsa
            </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default RunningCard;