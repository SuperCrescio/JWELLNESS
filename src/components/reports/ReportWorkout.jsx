import React, { useMemo, memo } from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { BarChart, BrainCircuit, Dumbbell } from 'lucide-react';
    import CardFallback from '@/components/reports/CardFallback';
    import MuscleDistributionChart from './MuscleDistributionChart';
    import WorkoutEfficiency from './WorkoutEfficiency';
    import CardiovascularLoad from './CardiovascularLoad';
    import MuscleProgression from './MuscleProgression';
    import MuscleRecovery from './MuscleRecovery';
    import SystemicFatigueRisk from './SystemicFatigueRisk';
    import WorkoutSessionAnalysis from './WorkoutSessionAnalysis';
    
    const ReportWorkout = ({ userData, biometricData, filteredData }) => {
      
      const filteredWorkouts = filteredData.workout_progress || [];
      const filteredBiometrics = filteredData.biometrics || [];
      const allWorkouts = userData?.workout_progress || [];
      const allBiometrics = biometricData || [];
    
      const workoutStats = useMemo(() => {
        if (!filteredWorkouts || filteredWorkouts.length === 0) return { totalWorkouts: 0, avgDuration: 0, totalTonnage: 0 };
    
        let totalDuration = 0;
        let totalTonnage = 0;
    
        filteredWorkouts.forEach(w => {
            totalDuration += w.duration || 0;
            if (w.exercises) {
                totalTonnage += w.exercises.reduce((sessionTonnage, ex) => {
                    const sets = ex.completedSets || [];
                    return sessionTonnage + sets.reduce((exerciseTonnage, set) => {
                        const reps = parseFloat(set.reps) || 0;
                        const weight = parseFloat(set.weight) || 0;
                        return exerciseTonnage + (reps * weight);
                    }, 0);
                }, 0);
            }
        });
        
        return {
          totalWorkouts: filteredWorkouts.length,
          avgDuration: filteredWorkouts.length > 0 ? Math.round(totalDuration / filteredWorkouts.length) : 0,
          totalTonnage: Math.round(totalTonnage),
        };
      }, [filteredWorkouts]);
    
      const renderContent = () => {
        if (filteredWorkouts.length === 0) {
          return <CardFallback message="Nessun dato di allenamento disponibile per il periodo selezionato." />;
        }
        return (
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2 text-blue-500" />
                  Riepilogo Allenamenti
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg text-white shadow-lg">
                    <div className="text-3xl font-bold">{workoutStats.totalWorkouts}</div>
                    <div className="text-sm opacity-90">Sessioni</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-400 to-green-600 rounded-lg text-white shadow-lg">
                    <div className="text-3xl font-bold">{workoutStats.avgDuration}</div>
                    <div className="text-sm opacity-90">Durata Media (min)</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-lg text-white shadow-lg">
                    <div className="text-3xl font-bold">{workoutStats.totalTonnage.toLocaleString('it-IT')}</div>
                    <div className="text-sm opacity-90">Tonnellaggio Totale (kg)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center"><BrainCircuit className="w-5 h-5 mr-2 text-purple-500" />Micro-Analisi Sessioni (AI)</CardTitle>
                    <p className="text-sm text-gray-500">Analisi dettagliata di ogni allenamento per ottimizzare la tua performance.</p>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                    {filteredWorkouts.map((session, index) => (
                        <WorkoutSessionAnalysis 
                            key={session.date || index} 
                            workoutSession={session} 
                            allBiometrics={allBiometrics} 
                            userName={userData?.first_name}
                        />
                    ))}
                </CardContent>
            </Card>
            
            <SystemicFatigueRisk allBiometrics={allBiometrics} allWorkouts={allWorkouts} userName={userData?.first_name} />

            <MuscleProgression workouts={filteredWorkouts} userName={userData?.first_name} />

            <WorkoutEfficiency workouts={filteredWorkouts} userName={userData?.first_name} />

            <CardiovascularLoad workouts={filteredWorkouts} biometrics={filteredBiometrics} userName={userData?.first_name} />

            <MuscleRecovery workouts={allWorkouts} userName={userData?.first_name} />
            
            <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 flex items-center"><BarChart className="w-5 h-5 mr-2 text-green-500" />Distribuzione Muscolare del Volume</CardTitle>
                     <p className="text-sm text-gray-500">Bilancia il carico per uno sviluppo armonico.</p>
                </CardHeader>
                <CardContent className="p-0">
                    <MuscleDistributionChart workouts={filteredWorkouts} />
                </CardContent>
            </Card>
          </div>
        );
      };
    
      return (
        <div className="space-y-4 sm:space-y-6">
          {renderContent()}
        </div>
      );
    };
    
    export default memo(ReportWorkout);