import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Timer, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import CardFallback from './CardFallback';

const MuscleRecovery = ({ workouts, userName }) => {
  const [recoveryData, setRecoveryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecoveryData = async () => {
      if (!workouts || workouts.length === 0) {
        setLoading(false);
        setRecoveryData(null);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-muscle-recovery', {
          body: { workouts, userName },
        });
        if (error) throw error;
        setRecoveryData(data);
      } catch (err) {
        console.error("Failed to fetch muscle recovery data:", err);
        setRecoveryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecoveryData();
  }, [workouts, userName]);

  const renderStatus = (status) => {
    if (status === '✅ OK') {
      return <span className="flex items-center text-green-600"><CheckCircle className="w-4 h-4 mr-2" /> OK</span>;
    }
    return <span className="flex items-center text-red-600"><AlertTriangle className="w-4 h-4 mr-2" /> Scarso</span>;
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

  if (!recoveryData || !recoveryData.analysis || recoveryData.analysis.length === 0) {
    return (
      <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <Timer className="w-5 h-5 mr-2 text-orange-500" />
            Carico vs Recupero Muscolare
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CardFallback message="Dati insufficienti per analizzare il recupero. Completa più allenamenti per abilitare questo report." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <Timer className="w-5 h-5 mr-2 text-orange-500" />
          Carico vs Recupero Muscolare (Riposo per Muscolo)
        </CardTitle>
        <p className="text-sm text-gray-500">Analizza i tempi di riposo per ottimizzare la crescita e prevenire l'overtraining.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-lg mb-6">
          <p className="text-sm text-orange-800 italic flex items-start">
            <Sparkles className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-orange-600" />
            <span>{recoveryData.aiMessage}</span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Gruppo Muscolare</TableHead>
                <TableHead className="text-center font-semibold">Ultima Stimolazione</TableHead>
                <TableHead className="text-center font-semibold">Recupero (ore)</TableHead>
                <TableHead className="text-right font-semibold">Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recoveryData.analysis.map((item) => (
                <TableRow key={item.group}>
                  <TableCell className="font-medium">{item.group}</TableCell>
                  <TableCell className="text-center">{new Date(item.lastStimulation).toLocaleDateString('it-IT')}</TableCell>
                  <TableCell className="text-center">{item.recoveryTimeHours !== null ? `${item.recoveryTimeHours}h` : 'N/A'}</TableCell>
                  <TableCell className="text-right font-semibold">{renderStatus(item.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(MuscleRecovery);