import React, { useState, useMemo, memo } from 'react';
    import { motion } from 'framer-motion';
    import { Card } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { BarChart3, Apple, Dumbbell, Activity, ServerCrash, BrainCircuit, HeartPulse } from 'lucide-react';
    import ReportOverview from '@/components/reports/ReportOverview';
    import ReportNutrition from '@/components/reports/ReportNutrition';
    import ReportWorkout from '@/components/reports/ReportWorkout';
    import ReportBia from '@/components/reports/ReportBia';
    import ReportMeditation from '@/components/reports/ReportMeditation';
    import DateRangeSelector from '@/components/reports/DateRangeSelector';
    import ReportBiometrics from '@/components/reports/ReportBiometrics';
    import { filterDataByDateRange } from '@/lib/dateUtils';
    
    const Reports = ({ userData, biometricData }) => {
      const [selectedReport, setSelectedReport] = useState('biometrics');
      const [dateRange, setDateRange] = useState('total');
    
      const userName = useMemo(() => {
        if (!userData) return '...';
        return (userData.first_name && userData.last_name) 
          ? `${userData.first_name} ${userData.last_name}` 
          : (userData.first_name || userData.last_name || 'Utente');
      }, [userData]);
    
      const reportTypes = useMemo(() => [
        { id: 'biometrics', label: 'Biometria', icon: HeartPulse },
        { id: 'workout', label: 'Workout', icon: Dumbbell },
        { id: 'nutrition', label: 'Alimenti', icon: Apple },
        { id: 'bia', label: 'BIA', icon: Activity },
        { id: 'meditation', label: 'Meditazione', icon: BrainCircuit },
        { id: 'overview', label: 'Panoramica', icon: BarChart3 },
      ], []);
    
      const filteredData = useMemo(() => {
        return {
          nutrition_progress: filterDataByDateRange(userData.nutrition_progress, dateRange, 'date'),
          workout_progress: filterDataByDateRange(userData.workout_progress, dateRange, 'date'),
          bia_history: filterDataByDateRange(userData.bia_history, dateRange, 'patientInfo.testDate'),
          meditation_sessions: filterDataByDateRange(userData.meditation_sessions, dateRange, 'timestamp'),
          biometrics: filterDataByDateRange(biometricData, dateRange, 'recorded_at'),
        };
      }, [userData, biometricData, dateRange]);
    
      if (!userData) {
        return (
            <Card className="p-6 text-center bg-white/60 backdrop-blur-sm border-0">
                <ServerCrash className="w-12 h-12 mx-auto mb-4 text-red-500"/>
                <h2 className="text-xl font-bold text-gray-800">Dati non disponibili</h2>
                <p className="text-gray-600">Impossibile caricare i dati per i report. Riprova più tardi.</p>
            </Card>
        );
      }
    
      const renderContent = () => {
        let props = { userData, dateRange, filteredData, biometricData };

        switch (selectedReport) {
          case 'overview':
            return <ReportOverview {...props} />;
          case 'biometrics':
            return <ReportBiometrics {...props} />;
          case 'nutrition':
            return <ReportNutrition {...props} />;
          case 'workout':
            return <ReportWorkout {...props} />;
          case 'bia':
            return <ReportBia {...props} />;
          case 'meditation':
            return <ReportMeditation {...props} />;
          default:
            return <ReportBiometrics {...props} />;
        }
      };
    
      return (
        <div className="space-y-4 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Report di {userName}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Analisi dettagliate dei tuoi progressi.
            </p>
          </motion.div>
    
          <Card className="p-3 sm:p-4 bg-white/60 backdrop-blur-sm border-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={selectedReport === type.id ? "default" : "outline"}
                        size="sm"
                        className={`flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2 h-auto min-h-[2.5rem] ${selectedReport === type.id 
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' 
                          : 'bg-white/80 hover:bg-white'
                        }`}
                        onClick={() => setSelectedReport(type.id)}
                      >
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{type.label}</span>
                      </Button>
                    );
                  })}
                </div>
                <div className="border-t sm:border-t-0 sm:border-l border-gray-200/50 pt-3 sm:pt-0 sm:pl-4">
                    <DateRangeSelector selectedRange={dateRange} onRangeChange={setDateRange} />
                </div>
            </div>
          </Card>
    
          <motion.div
            key={`${selectedReport}-${dateRange}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      );
    };
    
    export default memo(Reports);