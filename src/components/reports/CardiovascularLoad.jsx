import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse, Weight, Sparkles, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import CardFallback from './CardFallback';

const CardiovascularLoad = ({ workouts, biometrics, userName }) => {
  const [analysisData, setAnalysisData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!workouts || workouts.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-cardiovascular-load', {
          body: { workouts, biometrics, userName },
        });
        if (error) throw error;
        setAnalysisData(data);
      } catch (err) {
        console.error("Failed to fetch cardiovascular load analysis:", err);
        setAnalysisData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [workouts, biometrics, userName]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'efficiente':
        return { icon: <CheckCircle className="w-6 h-6 text-green-500" />, color: 'border-green-500', text: 'Efficiente' };
      case 'borderline':
        return { icon: <Zap className="w-6 h-6 text-yellow-500" />, color: 'border-yellow-500', text: 'Borderline' };
      case 'inefficiente':
        return { icon: <AlertTriangle className="w-6 h-6 text-red-500" />, color: 'border-red-500', text: 'Inefficiente' };
      default:
        return { icon: <AlertTriangle className="w-6 h-6 text-gray-400" />, color: 'border-gray-400', text: 'Dati Insufficienti' };
    }
  };

  if (loading) {
    return (
      <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        </div>
      </Card>
    );
  }

  if (!analysisData || analysisData.length === 0) {
    return (
      <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <HeartPulse className="w-5 h-5 mr-2 text-rose-500" />
            Indice di Carico Cardiovascolare
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CardFallback message="Nessun dato disponibile per analizzare il carico cardiovascolare. Assicurati di registrare allenamenti con tonnellaggio e dati di battito cardiaco." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <HeartPulse className="w-5 h-5 mr-2 text-rose-500" />
          Indice di Carico Cardiovascolare (Kg/BPM)
        </CardTitle>
        <p className="text-sm text-gray-500">Valuta l'efficienza del tuo cuore rispetto al carico di lavoro.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analysisData.map((session, index) => {
            const { icon, color, text } = getStatusStyle(session.status);
            return (
              <Card key={index} className={`p-4 border-l-4 ${color} bg-white`}>
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-700">{new Date(session.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long' })}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {icon}
                    <span>{text}</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Tonnellaggio</p>
                    <p className="font-bold text-lg">{session.tonnage.toLocaleString('it-IT')} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">BPM Medi</p>
                    <p className="font-bold text-lg">{session.avgHr.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Indice Kg/BPM</p>
                    <p className="font-bold text-lg">{session.index}</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50/70 rounded-md">
                  <p className="text-xs text-gray-600 italic flex items-start">
                    <Sparkles className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-rose-500" />
                    <span>{session.aiMessage}</span>
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(CardiovascularLoad);