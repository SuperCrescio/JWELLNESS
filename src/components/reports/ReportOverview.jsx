import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Apple, Dumbbell, Target, TrendingUp, Activity, BrainCircuit } from 'lucide-react';

const ReportOverview = ({ userData, filteredData }) => {

  const getOverviewStats = () => {
    const nutritionProgress = filteredData.nutrition_progress || [];
    const workoutProgress = filteredData.workout_progress || [];

    const totalMeals = nutritionProgress.length;
    const totalWorkouts = workoutProgress.length;

    const uniqueNutritionDays = new Set(nutritionProgress.map(p => new Date(p.date).toDateString())).size;
    const avgCalories = uniqueNutritionDays > 0
      ? Math.round(nutritionProgress.reduce((sum, meal) => sum + (meal.calories || 0), 0) / uniqueNutritionDays)
      : 0;

    const workoutsWithDuration = workoutProgress.filter(w => typeof w.duration === 'number' && w.duration > 0);
    const totalDuration = workoutsWithDuration.reduce((sum, workout) => sum + workout.duration, 0);
    const uniqueWorkoutDays = new Set(workoutProgress.map(p => new Date(p.date).toDateString())).size;

    const avgWorkoutDuration = uniqueWorkoutDays > 0
      ? Math.round(totalDuration / uniqueWorkoutDays)
      : 0;

    const originalNutritionProgress = userData.nutrition_progress || [];
    const originalWorkoutProgress = userData.workout_progress || [];
    const last28Days = new Date();
    last28Days.setDate(last28Days.getDate() - 28);
    
    const uniqueMealDaysLast28 = new Set(originalNutritionProgress.filter(p => new Date(p.date) >= last28Days).map(p => new Date(p.date).toDateString())).size;
    const uniqueWorkoutDaysLast28 = new Set(originalWorkoutProgress.filter(p => new Date(p.date) >= last28Days).map(p => new Date(p.date).toDateString())).size;

    const consistency = Math.round(((uniqueMealDaysLast28 + uniqueWorkoutDaysLast28) / (28*2)) * 100) || 0;

    return {
      totalMeals,
      totalWorkouts,
      avgCalories,
      avgWorkoutDuration,
      consistency
    };
  };

  const getBiaStats = () => {
    const biaHistory = filteredData.bia_history || [];
    if (biaHistory.length === 0) return null;

    const sortedHistory = [...biaHistory]
      .filter(item => item && item.patientInfo?.testDate)
      .sort((a, b) => new Date(a.patientInfo.testDate) - new Date(b.patientInfo.testDate));
      
    if (sortedHistory.length === 0) return null;
    
    const latestBia = sortedHistory[sortedHistory.length - 1];
    
    const fullHistorySorted = [...(userData.bia_history || [])]
      .filter(item => item && item.patientInfo?.testDate)
      .sort((a, b) => new Date(a.patientInfo.testDate) - new Date(b.patientInfo.testDate));
      
    const latestBiaIndex = fullHistorySorted.findIndex(item => item.patientInfo.testDate === latestBia.patientInfo.testDate);
    const previousBia = latestBiaIndex > 0 ? fullHistorySorted[latestBiaIndex - 1] : null;

    if (!latestBia) return null;
    
    const getValues = (record) => {
        if (!record) return {};
        return {
            weightKg: record.bodyCompositionAnalysis?.weightKg,
            bodyFatPercentage: record.obesityDiagnosis?.percentBodyFat,
            skeletalMuscleMassKg: record.muscleFatAnalysis?.skeletalMuscleMassKg,
        };
    };

    const latestValues = getValues(latestBia);
    const previousValues = getValues(previousBia);
    
    const changes = previousBia ? {
      weightKg: (latestValues.weightKg != null && previousValues.weightKg != null) ? (latestValues.weightKg - previousValues.weightKg) : null,
      bodyFatPercentage: (latestValues.bodyFatPercentage != null && previousValues.bodyFatPercentage != null) ? (latestValues.bodyFatPercentage - previousValues.bodyFatPercentage) : null,
      skeletalMuscleMassKg: (latestValues.skeletalMuscleMassKg != null && previousValues.skeletalMuscleMassKg != null) ? (latestValues.skeletalMuscleMassKg - previousValues.skeletalMuscleMassKg) : null,
    } : null;

    return { latest: latestValues, changes };
  };

  const getMeditationStats = () => {
    const meditationSessions = (filteredData.meditation_sessions || []).filter(s => s.obiettivo && typeof s.durata_effettiva === 'number');
    if (meditationSessions.length === 0) return null;

    const statsByObjective = meditationSessions.reduce((acc, session) => {
      const objective = session.obiettivo;
      if (!acc[objective]) {
        acc[objective] = { totalDuration: 0, count: 0 };
      }
      acc[objective].totalDuration += session.durata_effettiva;
      acc[objective].count += 1;
      return acc;
    }, {});

    const avgDurationByObjective = Object.keys(statsByObjective).map(objective => ({
      objective,
      avgDuration: Math.round(statsByObjective[objective].totalDuration / statsByObjective[objective].count)
    }));

    return { avgDurationByObjective };
  };


  const overviewStats = getOverviewStats();
  const biaStats = getBiaStats();
  const meditationStats = getMeditationStats();

  const renderValue = (value, decimals = 1) => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value.toFixed(decimals);
    }
    return '--';
  };

  const renderChange = (changeValue, unit, positiveIsGood = false) => {
    if (changeValue === null || changeValue === undefined || isNaN(changeValue)) return null;
    
    const value = parseFloat(changeValue);
    const isPositive = value >= 0;
    
    let colorClass = 'text-gray-500';
    if (value !== 0) {
      if (positiveIsGood) {
        colorClass = isPositive ? 'text-green-500' : 'text-red-500';
      } else {
        colorClass = isPositive ? 'text-red-500' : 'text-green-500';
      }
    }

    return (
      <div className={`text-xs mt-1 font-medium ${colorClass}`}>
        {isPositive ? '+' : ''}{value.toFixed(1)}{unit}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <Card className="p-3 sm:p-4 md:p-6 bg-white/60 backdrop-blur-sm border-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Pasti Registrati</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{overviewStats.totalMeals}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-green-400 to-green-600 flex-shrink-0">
              <Apple className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 md:p-6 bg-white/60 backdrop-blur-sm border-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Allenamenti</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{overviewStats.totalWorkouts}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 flex-shrink-0">
              <Dumbbell className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 md:p-6 bg-white/60 backdrop-blur-sm border-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">Consistenza (28 gg)</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600">{overviewStats.consistency}%</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 flex-shrink-0">
              <Target className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-3 sm:p-4 md:p-6 bg-white/60 backdrop-blur-sm border-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
          <span className="truncate">Riepilogo Performance</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Alimentazione (media/giorno)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Calorie</span>
                <span className="font-medium text-xs sm:text-sm">{overviewStats.avgCalories} kcal</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Allenamento (media/giorno)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Durata</span>
                <span className="font-medium text-xs sm:text-sm">{overviewStats.avgWorkoutDuration} min</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {biaStats && biaStats.latest && (
        <Card className="p-3 sm:p-4 md:p-6 bg-white/60 backdrop-blur-sm border-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" />
            <span className="truncate">Variazione Composizione Corporea</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center p-2 sm:p-4 bg-white/50 rounded-lg">
              <div className="text-sm sm:text-lg font-bold text-gray-800">
                {renderValue(biaStats.latest.weightKg)}kg
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Peso</div>
              {biaStats.changes && renderChange(biaStats.changes.weightKg, 'kg', false)}
            </div>
            <div className="text-center p-2 sm:p-4 bg-white/50 rounded-lg">
              <div className="text-sm sm:text-lg font-bold text-gray-800">
                {renderValue(biaStats.latest.bodyFatPercentage)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Grasso</div>
              {biaStats.changes && renderChange(biaStats.changes.bodyFatPercentage, '%', false)}
            </div>
            <div className="text-center p-2 sm:p-4 bg-white/50 rounded-lg col-span-2 md:col-span-1">
              <div className="text-sm sm:text-lg font-bold text-gray-800">
                {renderValue(biaStats.latest.skeletalMuscleMassKg)}kg
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Muscolo</div>
              {biaStats.changes && renderChange(biaStats.changes.skeletalMuscleMassKg, 'kg', true)}
            </div>
          </div>
        </Card>
      )}

      {meditationStats && meditationStats.avgDurationByObjective.length > 0 && (
        <Card className="p-3 sm:p-4 md:p-6 bg-white/60 backdrop-blur-sm border-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-500" />
            <span className="truncate">Riepilogo Meditazione</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
            {meditationStats.avgDurationByObjective.map(item => (
              <div key={item.objective} className="text-center p-2 sm:p-4 bg-white/50 rounded-lg">
                <div className="text-sm sm:text-lg font-bold text-gray-800">
                  {item.avgDuration} min
                </div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">Media {item.objective}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportOverview;