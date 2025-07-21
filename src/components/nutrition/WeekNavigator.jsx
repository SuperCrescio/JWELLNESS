import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WeekNavigator = ({ weekDays, selectedDay, setSelectedDay, changeWeek }) => {
    if (!weekDays || weekDays.length === 0) {
        return null;
    }
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="p-0.5 glass-effect border-0 mb-2.5">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeWeek(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center space-x-0.5 sm:space-x-1 overflow-x-auto scrollbar-hide">
                        {weekDays.map((day) => (
                            <Button
                                key={day.toDateString()}
                                variant={selectedDay === day.toDateString() ? "default" : "outline"}
                                className={`min-w-[36px] flex-shrink-0 h-auto py-0.5 px-0.5 ${selectedDay === day.toDateString()
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                        : 'bg-white/50 hover:bg-white/70'
                                    }`}
                                onClick={() => setSelectedDay(day.toDateString())}
                            >
                                <div className="text-center">
                                    <div className="text-[8px] font-medium">
                                        {day.toLocaleDateString('it-IT', { weekday: 'short' })}
                                    </div>
                                    <div className="text-[9px] font-bold">
                                        {day.getDate()}
                                    </div>
                                </div>
                            </Button>
                        ))}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeWeek(1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
};

export default WeekNavigator;