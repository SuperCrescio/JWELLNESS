import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Loader2, AlertCircle, TrendingUp, TrendingDown, Minus, Brain, Heart, Wind, Footprints, Moon, Droplets, Dumbbell, Sparkles, Check, X } from 'lucide-react';
    import { getStartDateFromRange, filterDataByDateRange } from '@/lib/dateUtils';
    
    const BiometricWeeklyReport = ({ userData: fullUserData, dateRange }) => {
      const { user } = useAuth();
      const [report, setReport] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
    
      useEffect(() => {
        const generateReport = async () => {
          if (!user || !fullUserData) return;
          setLoading(true);
          setError(null);
    
          try {
            const startDate = getStartDateFromRange(dateRange);
            let query = supabase
              .from('biometric_data')
              .select('*')
              .eq('user_id', user.id);
    
            if (startDate) {
              query = query.gte('recorded_at', startDate.toISOString());
            }
    
            const { data: biometricData, error: dbError } = await query;
            if (dbError) throw dbError;
    
            if (!biometricData || biometricData.length < 10) {
                throw new Error("Dati biometrici insufficienti per generare un report significativo. Sincronizza più dati.");
            }
            
            const userName = (fullUserData?.first_name || 'Utente');
            
            const holisticData = {
                biometricData,
                userName,
                nutritionData: filterDataByDateRange(fullUserData.nutrition_progress, dateRange, 'date'),
                workoutData: filterDataByDateRange(fullUserData.workout_progress, dateRange, 'date'),
                biaData: filterDataByDateRange(fullUserData.bia_history, dateRange, 'patientInfo.testDate'),
                meditationData: filterDataByDateRange(fullUserData.meditation_sessions, dateRange, 'timestamp'),
            };

            const { data: reportData, error: functionError } = await supabase.functions.invoke('analyze-biometrics', {
              body: JSON.stringify(holisticData),
            });
    
            if (functionError) throw new Error(functionError.message);
            if (reportData.error) throw new Error(reportData.error);
            
            setReport(reportData);
    
          } catch (e) {
            console.error("Error generating biometric report:", e);
            setError(e.message);
          } finally {
            setLoading(false);
          }
        };
    
        generateReport();
      }, [user, fullUserData, dateRange]);
    
      const containerVariants = {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
      };

      const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 100,
          },
        },
      };

      if (loading) {
        return (
          <div className="p-6 text-center bg-transparent min-h-[400px] flex flex-col justify-center items-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-600" />
            <p className="mt-4 text-gray-800 font-semibold">L'intelligenza artificiale sta analizzando i tuoi dati...</p>
            <p className="text-sm text-gray-600">Potrebbe richiedere fino a 30 secondi.</p>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className="p-6 text-center bg-red-50/50 rounded-xl min-h-[400px] flex flex-col justify-center items-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Errore nell'Analisi</h3>
            <p className="text-red-700 max-w-md">{error}</p>
          </div>
        );
      }
    
      if (!report) {
        return null;
      }
      
      const { weeklySummary, detailedAnalysis, cardioAnalysis, oxygenationAnalysis, stressAnalysis, stepsAnalysis, aiRecommendations, conclusion } = report;
    
      const getTrendIcon = (trend) => {
        if (trend > 0) return <TrendingUp className="w-5 h-5 text-green-500" />;
        if (trend < 0) return <TrendingDown className="w-5 h-5 text-red-500" />;
        return <Minus className="w-5 h-5 text-gray-500" />;
      };
    
      const getRecommendationIcon = (icon) => {
        switch (icon) {
            case 'sleep': return <Moon className="w-6 h-6 text-indigo-500"/>;
            case 'consistency': return <Dumbbell className="w-6 h-6 text-blue-500"/>;
            case 'hydration': return <Droplets className="w-6 h-6 text-cyan-500"/>;
            case 'rest': return <Brain className="w-6 h-6 text-purple-500"/>;
            default: return <Sparkles className="w-6 h-6 text-gray-500"/>;
        }
      }
    
      return (
        <motion.div
          className="space-y-6 bg-gradient-to-br from-purple-50/30 via-indigo-50/30 to-blue-50/30 p-4 rounded-xl border border-purple-100/50"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            <motion.div variants={itemVariants}>
              <Card className="p-4 sm:p-6 bg-purple-100/50 border-purple-200/50 glass-effect">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{weeklySummary.title}</h2>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                          <div className="text-4xl sm:text-5xl font-bold gradient-text">{weeklySummary.activityIndex.score} <span className="text-xl sm:text-2xl text-gray-700">/100</span></div>
                          <div className="flex items-center gap-2">
                              {getTrendIcon(weeklySummary.activityIndex.trend)}
                              <span className="text-xs sm:text-sm font-semibold text-gray-700">{Math.abs(weeklySummary.activityIndex.trend)}% vs scorsa sett.</span>
                          </div>
                      </div>
                      <div className="text-xs sm:text-sm text-purple-800 bg-purple-200/50 p-3 rounded-lg border border-purple-300/80">
                          <span className="font-bold">AI Coach:</span> {weeklySummary.activityIndex.recommendation}
                      </div>
                  </div>
              </Card>
            </motion.div>
    
            <motion.div variants={itemVariants}>
              <Card className="p-4 sm:p-6 bg-white/50 border-gray-200/50 glass-effect">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Analisi Giornaliera Dettagliata</h3>
                  <div className="overflow-x-auto scrollbar-hide">
                      <table className="w-full text-sm text-left min-w-[500px] sm:min-w-full">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-100/50">
                              <tr>
                                  <th scope="col" className="px-2 sm:px-4 py-3">Giorno</th>
                                  <th scope="col" className="px-2 sm:px-4 py-3">Workout</th>
                                  <th scope="col" className="px-2 sm:px-4 py-3">Durata</th>
                                  <th scope="col" className="px-2 sm:px-4 py-3">Ora</th>
                                  <th scope="col" className="px-2 sm:px-4 py-3">Stress</th>
                                  <th scope="col" className="px-2 sm:px-4 py-3">Passi</th>
                              </tr>
                          </thead>
                          <tbody>
                              {detailedAnalysis.map((day, index) => (
                                  <tr key={index} className="border-b border-gray-200/50 last:border-b-0">
                                      <td className="px-2 sm:px-4 py-3 font-medium text-gray-900">{day.day}</td>
                                      <td className="px-2 sm:px-4 py-3 text-gray-900">{day.workoutDetected ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-500" />}</td>
                                      <td className="px-2 sm:px-4 py-3 text-gray-900">{day.workoutDetected ? `${day.estimatedDuration} min` : '—'}</td>
                                      <td className="px-2 sm:px-4 py-3 text-gray-900">{day.workoutDetected ? day.estimatedTime : '—'}</td>
                                      <td className="px-2 sm:px-4 py-3 text-gray-900">{day.dailyStress}</td>
                                      <td className="px-2 sm:px-4 py-3 text-gray-900">{day.totalSteps.toLocaleString('it-IT')}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </Card>
            </motion.div>
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <motion.div variants={itemVariants}>
                  <Card className="p-4 sm:p-6 bg-white/50 border-gray-200/50 glass-effect h-full">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center"><Heart className="w-5 h-5 mr-3 text-red-500"/> Analisi Cardio</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3">
                          <div className="flex justify-between text-sm"><span className="text-gray-700">FC media allenamenti:</span> <span className="font-bold text-gray-900">{cardioAnalysis.avgHeartRate} bpm</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-700">Recupero post-allenamento:</span> <span className="font-bold text-gray-900">{cardioAnalysis.postWorkoutRecovery} min</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-700">FC media a riposo:</span> <span className="font-bold text-gray-900">{cardioAnalysis.restingHeartRate} bpm</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-700">Picco massimo registrato:</span> <span className="font-bold text-gray-900">{cardioAnalysis.peakHeartRate.value} bpm</span></div>
                      </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Card className="p-4 sm:p-6 bg-white/50 border-gray-200/50 glass-effect h-full">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center"><Wind className="w-5 h-5 mr-3 text-cyan-500"/> Ossigenazione</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3">
                          <div className="flex justify-between text-sm"><span className="text-gray-700">SpO2 media settimana:</span> <span className="font-bold text-gray-900">{oxygenationAnalysis.avgSpO2}%</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-700">Minimo registrato:</span> <span className="font-bold text-gray-900">{oxygenationAnalysis.minSpO2.value}% ({oxygenationAnalysis.minSpO2.context})</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-700">Variazioni critiche:</span> <span className="font-bold text-gray-900">{oxygenationAnalysis.criticalVariations}</span></div>
                      </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Card className="p-4 sm:p-6 bg-white/50 border-gray-200/50 glass-effect h-full">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center"><Brain className="w-5 h-5 mr-3 text-yellow-500"/> Stress Score</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3">
                          <div className="text-sm"><span className="text-gray-700">Giorni stress da workout:</span> <span className="font-bold text-gray-900">{stressAnalysis.highStressWorkoutDays.join(', ') || 'Nessuno'}</span></div>
                          <div className="text-sm"><span className="text-gray-700">Giorni stress psicologico:</span> <span className="font-bold text-gray-900">{stressAnalysis.highStressRestDays.join(', ') || 'Nessuno'}</span></div>
                          <div className="text-sm"><span className="text-gray-700">Recupero stress post-workout:</span> <span className="font-bold text-gray-900">{stressAnalysis.recoveryTime} min</span></div>
                      </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Card className="p-4 sm:p-6 bg-white/50 border-gray-200/50 glass-effect h-full">
                      <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center"><Footprints className="w-5 h-5 mr-3 text-orange-500"/> Analisi Passi</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3">
                          <div className="flex justify-between text-sm"><span className="text-gray-700">Passi totali settimana:</span> <span className="font-bold text-gray-900">{stepsAnalysis.totalSteps.toLocaleString('it-IT')} ({stepsAnalysis.totalKm.toFixed(1)} km)</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-700">Media giornaliera:</span> <span className="font-bold text-gray-900">{stepsAnalysis.dailyAverage.toLocaleString('it-IT')}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-700">Picco:</span> <span className="font-bold text-gray-900">{stepsAnalysis.peakDay.day}, {stepsAnalysis.peakDay.steps.toLocaleString('it-IT')} passi</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-700">Giorni a bassa attività:</span> <span className="font-bold text-gray-900">{stepsAnalysis.lowActivityDays.join(', ') || 'Nessuno'}</span></div>
                      </CardContent>
                  </Card>
                </motion.div>
            </div>
    
            {aiRecommendations && Array.isArray(aiRecommendations) && aiRecommendations.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Card className="p-4 sm:p-6 bg-white/50 border-gray-200/50 glass-effect">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Raccomandazioni AI per la Prossima Settimana</h3>
                      <ul className="space-y-4">
                          {aiRecommendations.map(rec => (
                              <li key={rec.id} className="flex items-start gap-4 p-3 bg-gray-100/50 rounded-lg">
                                  <div className="flex-shrink-0 p-3 bg-white/80 rounded-full shadow-sm">{getRecommendationIcon(rec.icon)}</div>
                                  <p className="text-sm text-gray-800 flex-1 pt-2">{rec.recommendation}</p>
                              </li>
                          ))}
                      </ul>
                  </Card>
                </motion.div>
            )}
    
            <motion.div variants={itemVariants}>
                <Card className="p-4 sm:p-6 bg-white/60 border-gray-200/50 glass-effect text-center">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 italic">"{conclusion}"</p>
                </Card>
            </motion.div>
    
        </motion.div>
      );
    };
    
    export default BiometricWeeklyReport;