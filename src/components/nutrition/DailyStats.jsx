import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const DailyStats = ({ dayStats }) => {
    if (!dayStats) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <Card className="p-2 glass-effect border-0 mb-2.5">
                <h3 className="text-[11px] sm:text-sm font-semibold text-gray-800 mb-1.5 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1.5 text-green-500" />
                    Statistiche del Giorno
                </h3>
                <div className="grid grid-cols-3 gap-1 sm:grid-cols-5 sm:gap-2">
                    <div className="text-center">
                        <div className="text-xs sm:text-base font-bold text-green-600">{Math.round(dayStats.consumedCalories)}</div>
                        <div className="text-[9px] text-gray-600">Calorie</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs sm:text-base font-bold text-blue-600">{Math.round(dayStats.consumedProteins)}g</div>
                        <div className="text-[9px] text-gray-600">Proteine</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs sm:text-base font-bold text-orange-600">{Math.round(dayStats.consumedCarbs)}g</div>
                        <div className="text-[9px] text-gray-600">Carboidrati</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs sm:text-base font-bold text-purple-600">{Math.round(dayStats.consumedFats)}g</div>
                        <div className="text-[9px] text-gray-600">Grassi</div>
                    </div>
                    <div className="text-center col-span-3 mt-1 sm:col-span-1 sm:mt-0">
                        <div className="text-xs sm:text-base font-bold text-gray-800">{dayStats.mealsCount}</div>
                        <div className="text-[9px] text-gray-600">Pasti Fatti</div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default DailyStats;