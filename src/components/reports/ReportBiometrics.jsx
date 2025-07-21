import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { HeartPulse, Footprints, Moon, Brain, ServerCrash, Sparkles } from 'lucide-react';
import BiometricWeeklyReport from '@/components/reports/BiometricWeeklyReport';

const ReportBiometrics = ({ userData, dateRange, filteredData }) => {
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);

  if (!userData || !filteredData) {
    return (
      <Card className="p-6 text-center glass-effect border-0">
        <ServerCrash className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold text-gray-800">Dati non disponibili</h2>
        <p className="text-gray-600">Impossibile caricare i dati biometrici. Riprova più tardi.</p>
      </Card>
    );
  }

  const BiometricCard = ({ icon, title, value, unit, color }) => {
    const Icon = icon;
    return (
      <Card className="p-4 glass-effect border-0 card-hover h-full">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-800">
              {value} <span className="text-lg font-medium text-gray-500">{unit}</span>
            </p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Report Biometrico</h2>
        <Button onClick={() => setIsAiReportOpen(true)} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <Sparkles className="w-4 h-4 mr-2" />
          Mostra Report Settimanale AI
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <BiometricCard icon={HeartPulse} title="FC a riposo" value="65" unit="bpm" color="red" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <BiometricCard icon={Footprints} title="Passi medi" value="8,230" unit="" color="orange" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <BiometricCard icon={Moon} title="Sonno medio" value="7.5" unit="ore" color="indigo" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <BiometricCard icon={Brain} title="Stress medio" value="35" unit="%" color="yellow" />
        </motion.div>
      </div>

      <Dialog open={isAiReportOpen} onOpenChange={setIsAiReportOpen}>
        <DialogContent className="max-w-4xl w-full p-4 md:p-6 bg-gray-50/95">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">Report Settimanale AI</DialogTitle>
            <DialogDescription className="text-gray-700">
              Un'analisi olistica basata su tutti i tuoi dati biometrici e di allenamento.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto pr-2 scrollbar-hide">
            <BiometricWeeklyReport userData={userData} dateRange={dateRange} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportBiometrics;