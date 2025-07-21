import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Apple, Dumbbell, TrendingUp, Calendar, ServerCrash, BrainCircuit, Moon, Footprints, HeartPulse, Brain } from 'lucide-react';
import MuscleFatAnalysisCard from '@/components/reports/MuscleFatAnalysisCard';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AiRecommendations from '@/components/reports/AiRecommendations';

const Dashboard = ({ userData }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentBiometrics, setRecentBiometrics] = useState([]);

  useEffect(() => {
    const fetchBiometrics = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('biometric_data')
            .select('*')
            .eq('user_id', user.id)
            .order('recorded_at', { ascending: false })
            .limit(5);

        if (!error && data) {
            setRecentBiometrics(data);
        }
    };
    fetchBiometrics();

    const channel = supabase.channel('biometric_data_changes')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'biometric_data',
            filter: `user_id=eq.${user.id}`
        }, (payload) => {
            setRecentBiometrics(currentBiometrics => [payload.new, ...currentBiometrics]
                .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
                .slice(0, 5)
            );
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };

  }, [user]);

  if (!userData) {
    return (
        <Card className="p-6 text-center glass-effect border-0">
            <ServerCrash className="w-12 h-12 mx-auto mb-4 text-red-500"/>
            <h2 className="text-xl font-bold text-gray-800">Dati non disponibili</h2>
            <p className="text-gray-600">Impossibile caricare i dati per la dashboard. Riprova più tardi.</p>
        </Card>
    );
  }

  const getLatestBia = () => {
    if (!userData.bia_history || userData.bia_history.length === 0) {
      return null;
    }
    
    const sortedHistory = [...userData.bia_history]
      .filter(item => item && item.patientInfo?.testDate && !isNaN(new Date(item.patientInfo.testDate)))
      .sort((a, b) => new Date(b.patientInfo.testDate) - new Date(a.patientInfo.testDate));
      
    if (sortedHistory.length === 0) return null;

    return sortedHistory[0];
  };

  const latestBia = getLatestBia();
  const userName = (userData.first_name || 'Utente');

  const nutritionActivities = (userData.nutrition_progress || []).map(item => {
    const activityDate = new Date(item.date);
    if (item.time) {
        const [hours, minutes] = item.time.split(':');
        activityDate.setHours(parseInt(hours, 10));
        activityDate.setMinutes(parseInt(minutes, 10));
    }
    return {
        type: 'nutrition',
        title: `Pasto: ${item.mealName}`,
        date: activityDate,
        icon: Apple,
        color: 'bg-green-100 text-green-600'
    };
  });
  
  const workoutActivities = (userData.workout_progress || []).map(item => ({
    type: 'workout',
    title: `Allenamento: ${item.workoutName}`,
    date: new Date(item.date),
    icon: Dumbbell,
    color: 'bg-blue-100 text-blue-600'
  }));

  const meditationActivities = (userData.meditation_sessions || []).map(item => ({
    type: 'meditation',
    title: `Meditazione: ${item.obiettivo}`,
    date: new Date(item.timestamp),
    icon: BrainCircuit,
    color: 'bg-purple-100 text-purple-600'
  }));
  
  const biometricActivities = recentBiometrics.map(item => {
    let title = `Dato: ${item.data_type}`;
    let icon = Activity;
    let color = 'bg-gray-100 text-gray-600';
    switch(item.data_type) {
        case 'sleep':
            title = `Sonno: ${item.value.totalHours} ore`;
            icon = Moon;
            color = 'bg-indigo-100 text-indigo-600';
            break;
        case 'steps':
            title = `Passi: ${item.value.count}`;
            icon = Footprints;
            color = 'bg-orange-100 text-orange-600';
            break;
        case 'heart_rate':
            title = `FC a riposo: ${item.value.resting} bpm`;
            icon = HeartPulse;
            color = 'bg-red-100 text-red-600';
            break;
        case 'stress':
            title = `Stress: ${Number(item.value.level).toFixed(0)}%`;
            icon = Brain;
            color = 'bg-yellow-100 text-yellow-600';
            break;
    }
    return { type: 'biometric', title, date: new Date(item.recorded_at), icon, color };
  });

  const recentActivity = [...nutritionActivities, ...workoutActivities, ...meditationActivities, ...biometricActivities]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  return (
    <div className="space-y-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Benvenuto, {userName}!
        </h1>
        <p className="text-gray-600">
          Monitora i tuoi progressi e raggiungi i tuoi obiettivi.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
         <AiRecommendations userData={userData} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {latestBia ? (
          <MuscleFatAnalysisCard latestBia={latestBia} />
        ) : (
          <Card className="p-6 text-center glass-effect border-0 w-full">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nessuna Analisi BIA disponibile
            </h3>
            <p className="text-gray-600 text-sm">
              Carica un report BIA per vedere i tuoi dati.
            </p>
          </Card>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 md:p-6 glass-effect border-0 h-full w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Azioni Rapide
            </h3>
            <div className="space-y-3">
              <Button onClick={() => navigate('/nutrition')} className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                <Apple className="w-4 h-4 mr-2" />
                Registra Pasto
              </Button>
              <Button onClick={() => navigate('/workout')} className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Dumbbell className="w-4 h-4 mr-2" />
                Inizia Allenamento
              </Button>
              <Button onClick={() => navigate('/reports')} className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                Visualizza Report
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 md:p-6 glass-effect border-0 h-full w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-500" />
              Attività Recenti
            </h3>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-white/50">
                      <div className={`p-2 mt-1 rounded-lg ${activity.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 whitespace-normal break-words">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} - {new Date(activity.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  Nessuna attività recente registrata.
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;