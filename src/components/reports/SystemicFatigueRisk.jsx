import React, { useState, useEffect, memo } from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
    import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceArea } from 'recharts';
    import { Activity, AlertTriangle, Sparkles } from 'lucide-react';
    import { supabase } from '@/lib/customSupabaseClient';
    import CardFallback from './CardFallback';

    const SystemicFatigueRisk = ({ allBiometrics, allWorkouts, userName }) => {
      const [analysis, setAnalysis] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchAnalysis = async () => {
          if (!allBiometrics && !allWorkouts) {
            setLoading(false);
            return;
          }
          setLoading(true);
          try {
            const { data, error } = await supabase.functions.invoke('analyze-systemic-fatigue', {
              body: { biometrics: allBiometrics, workouts: allWorkouts, userName },
            });
            if (error) throw error;
            setAnalysis(data);
          } catch (err) {
            console.error("Failed to fetch systemic fatigue analysis:", err);
            setAnalysis(null);
          } finally {
            setLoading(false);
          }
        };

        fetchAnalysis();
      }, [allBiometrics, allWorkouts, userName]);

      const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
          const stressPayload = payload.find(p => p.dataKey === 'stress');
          const tonnagePayload = payload.find(p => p.dataKey === 'tonnage');
          
          const stressValue = stressPayload?.value;
          const tonnageValue = tonnagePayload?.value;

          return (
            <div className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
              <p className="font-bold text-gray-800">{label}</p>
              <p className="text-sm text-orange-500">{`Stress Medio: ${typeof stressValue === 'number' ? stressValue.toFixed(0) : 'N/A'} %`}</p>
              <p className="text-sm text-indigo-500">{`Tonnellaggio: ${typeof tonnageValue === 'number' ? tonnageValue.toLocaleString('it-IT') : '0'} kg`}</p>
            </div>
          );
        }
        return null;
      };

      if (loading) {
        return (
          <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          </Card>
        );
      }

      if (!analysis || !analysis.chartData || analysis.chartData.every(d => d.stress === null && d.tonnage === 0)) {
        return (
          <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-orange-500" />
                Rischio Fatica Sistemica
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <CardFallback message="Dati insufficienti per l'analisi della fatica sistemica. Assicurati di registrare dati di stress e allenamenti." />
            </CardContent>
          </Card>
        );
      }

      return (
        <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-500" />
              Rischio Fatica Sistemica
            </CardTitle>
            <p className="text-sm text-gray-500">Monitora l'equilibrio tra carico di allenamento e stress fisiologico.</p>
          </CardHeader>
          <CardContent className="p-0">
            {analysis.riskDetected && (
              <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-bold">Attenzione: Rischio Rilevato!</AlertTitle>
                <AlertDescription className="flex items-start mt-2">
                  <Sparkles className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-red-600" />
                  <span className="text-red-800">{analysis.aiMessage}</span>
                </AlertDescription>
              </Alert>
            )}
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analysis.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={10} />
                <YAxis yAxisId="left" stroke="#f97316" fontSize={10} label={{ value: 'Stress (%)', angle: -90, position: 'insideLeft', fill: '#f97316' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={10} label={{ value: 'Tonnellaggio (kg)', angle: 90, position: 'insideRight', fill: '#6366f1' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: '10px' }} />
                <ReferenceArea yAxisId="left" y1={30} y2={100} stroke="transparent" fill="#ef4444" fillOpacity={0.1} ifOverflow="visible" />
                <Line yAxisId="left" type="monotone" dataKey="stress" name="Stress Medio" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} connectNulls />
                <Line yAxisId="right" type="monotone" dataKey="tonnage" name="Tonnellaggio" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>

            {!analysis.riskDetected && (
                <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-sm text-green-800 italic flex items-start">
                        <Sparkles className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-green-600" />
                        <span>{analysis.aiMessage}</span>
                    </p>
                </div>
            )}
          </CardContent>
        </Card>
      );
    };

    export default memo(SystemicFatigueRisk);