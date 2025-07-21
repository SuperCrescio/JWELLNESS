import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Apple, PieChart } from 'lucide-react';

const ReportNutrition = ({ filteredData }) => {

  const filteredMeals = filteredData.nutrition_progress || [];

  const getNutritionStats = () => {
    const meals = filteredMeals || [];

    if (meals.length === 0) {
      return {
        avgDaily: { calories: 0, proteins: 0, carbs: 0, fats: 0 },
        totalMeals: 0,
        macroPercentages: { proteins: 0, carbs: 0, fats: 0 }
      };
    }
    
    const totalsByDay = meals.reduce((acc, meal) => {
      const date = new Date(meal.date).toDateString();
      if (!acc[date]) {
        acc[date] = { calories: 0, proteins: 0, carbs: 0, fats: 0 };
      }
      acc[date].calories += meal.calories || 0;
      acc[date].proteins += meal.proteins || 0;
      acc[date].carbs += meal.carbs || 0;
      acc[date].fats += meal.fats || 0;
      return acc;
    }, {});

    const days = Object.keys(totalsByDay);
    const numDays = days.length;

    const totalCalories = days.reduce((sum, day) => sum + totalsByDay[day].calories, 0);
    const totalProteins = days.reduce((sum, day) => sum + totalsByDay[day].proteins, 0);
    const totalCarbs = days.reduce((sum, day) => sum + totalsByDay[day].carbs, 0);
    const totalFats = days.reduce((sum, day) => sum + totalsByDay[day].fats, 0);
    
    const avgDaily = {
      calories: Math.round(totalCalories / numDays) || 0,
      proteins: Math.round(totalProteins / numDays) || 0,
      carbs: Math.round(totalCarbs / numDays) || 0,
      fats: Math.round(totalFats / numDays) || 0
    };

    const totalMacroGrams = totalProteins + totalCarbs + totalFats;
    const macroPercentages = totalMacroGrams > 0 ? {
      proteins: Math.round((totalProteins / totalMacroGrams) * 100),
      carbs: Math.round((totalCarbs / totalMacroGrams) * 100),
      fats: Math.round((totalFats / totalMacroGrams) * 100)
    } : { proteins: 0, carbs: 0, fats: 0 };


    return { avgDaily, totalMeals: meals.length, macroPercentages };
  };

  const nutritionStats = getNutritionStats();
  const { macroPercentages } = nutritionStats;

  if (nutritionStats.totalMeals === 0) {
     return (
      <Card className="p-8 sm:p-12 glass-effect border-0 text-center">
        <Apple className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
          Nessun Dato Nutrizionale
        </h3>
        <p className="text-gray-600 text-sm">
          Registra i tuoi pasti per visualizzare questo report.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="p-3 sm:p-4 md:p-6 glass-effect border-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <Apple className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
          <span className="truncate">Media Nutrizionale Giornaliera</span>
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="text-center p-2 sm:p-3 md:p-4 bg-gradient-to-r from-green-400 to-green-600 rounded-lg text-white">
            <div className="text-sm sm:text-xl md:text-2xl font-bold">{nutritionStats.avgDaily.calories}</div>
            <div className="text-xs md:text-sm opacity-90">Calorie</div>
          </div>
          <div className="text-center p-2 sm:p-3 md:p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg text-white">
            <div className="text-sm sm:text-xl md:text-2xl font-bold">{nutritionStats.avgDaily.proteins}g</div>
            <div className="text-xs md:text-sm opacity-90">Proteine</div>
          </div>
          <div className="text-center p-2 sm:p-3 md:p-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg text-white">
            <div className="text-sm sm:text-xl md:text-2xl font-bold">{nutritionStats.avgDaily.carbs}g</div>
            <div className="text-xs md:text-sm opacity-90">Carboidrati</div>
          </div>
          <div className="text-center p-2 sm:p-3 md:p-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg text-white">
            <div className="text-sm sm:text-xl md:text-2xl font-bold">{nutritionStats.avgDaily.fats}g</div>
            <div className="text-xs md:text-sm opacity-90">Grassi</div>
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4 md:p-6 glass-effect border-0">
        <h4 className="font-medium text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base flex items-center">
          <PieChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600" />
          <span className="truncate">Distribuzione Macronutrienti (%)</span>
        </h4>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Proteine</span>
              <span className="text-xs sm:text-sm font-medium">{macroPercentages.proteins}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${macroPercentages.proteins}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Carboidrati</span>
              <span className="text-xs sm:text-sm font-medium">{macroPercentages.carbs}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${macroPercentages.carbs}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Grassi</span>
              <span className="text-xs sm:text-sm font-medium">{macroPercentages.fats}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${macroPercentages.fats}%` }}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportNutrition;