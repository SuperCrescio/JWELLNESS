import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud, FileText, BarChart3, Dumbbell, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { processNutritionFile, processBiaFile, processWorkoutFile } from '@/lib/fileProcessing';

const FileUpload = ({ userData, updateUserData }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fileType, setFileType] = useState('nutrition');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Errore di Autenticazione",
        description: "Devi essere loggato per caricare file.",
      });
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('user_files').upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('user_files').getPublicUrl(filePath);
      const publicURL = publicUrlData.publicUrl;

      if (fileType === 'nutrition') {
        const nutritionData = await processNutritionFile(file);
        await updateUserData(nutritionData);
        toast({
            title: "Successo!",
            description: "Piano alimentare caricato e analizzato.",
            className: "bg-green-100 text-green-800",
        });
      } else if (fileType === 'bia') {
        const biaData = await processBiaFile(file);

        const newHistoryEntry = {
          ...biaData,
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          fileUrl: publicURL
        };

        const existingHistory = userData.bia_history || [];
        const existingEntryIndex = existingHistory.findIndex(
          entry => entry.patientInfo?.testDate === biaData.patientInfo?.testDate
        );

        let newHistory;
        let toastMessage = "Report BIA caricato e analizzato.";
        
        if (existingEntryIndex !== -1) {
          newHistory = [...existingHistory];
          newHistory[existingEntryIndex] = newHistoryEntry;
          toastMessage = "Report BIA esistente sovrascritto con successo.";
        } else {
          newHistory = [...existingHistory, newHistoryEntry];
        }
        
        await updateUserData({ bia_history: newHistory, bia_plan: biaData });
        toast({
            title: "Successo!",
            description: toastMessage,
            className: "bg-green-100 text-green-800",
        });

      } else if (fileType === 'workout') {
        const workoutData = await processWorkoutFile(file);
        await updateUserData({ workout_plan: workoutData });
        toast({
            title: "Successo!",
            description: "Piano di allenamento caricato e analizzato.",
            className: "bg-green-100 text-green-800",
        });
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        variant: "destructive",
        title: "Errore nell'elaborazione",
        description: error.message || "Qualcosa è andato storto.",
      });
    } finally {
      setIsProcessing(false);
      setUploadedFile(null);
    }
  }, [user, fileType, toast, updateUserData, userData]);
  
  const acceptConfig = useMemo(() => {
    if (fileType === 'bia') {
      return { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };
    }
    return { 'application/pdf': ['.pdf'] };
  }, [fileType]);

  const dropzoneMessage = useMemo(() => {
    if (fileType === 'bia') {
      return "File PDF, JPG o PNG";
    }
    return "Solo file PDF";
  }, [fileType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptConfig,
    multiple: false,
    disabled: isProcessing,
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Carica Documenti</h1>
        <p className="text-gray-600">
          Seleziona il tipo di documento e trascina il file per l'analisi.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Seleziona il tipo di file</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={fileType}
              onValueChange={setFileType}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              disabled={isProcessing}
            >
              <motion.div whileTap={{ scale: 0.98 }}>
                <RadioGroupItem value="nutrition" id="nutrition" className="peer sr-only" />
                <Label
                  htmlFor="nutrition"
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    fileType === 'nutrition'
                      ? 'border-blue-500 bg-blue-50/50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className={`w-8 h-8 mb-2 ${fileType === 'nutrition' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-semibold">Piano Alimentare</span>
                </Label>
              </motion.div>
              <motion.div whileTap={{ scale: 0.98 }}>
                <RadioGroupItem value="workout" id="workout" className="peer sr-only" />
                <Label
                  htmlFor="workout"
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    fileType === 'workout'
                      ? 'border-orange-500 bg-orange-50/50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Dumbbell className={`w-8 h-8 mb-2 ${fileType === 'workout' ? 'text-orange-600' : 'text-gray-500'}`} />
                  <span className="font-semibold">Piano Allenamento</span>
                </Label>
              </motion.div>
              <motion.div whileTap={{ scale: 0.98 }}>
                <RadioGroupItem value="bia" id="bia" className="peer sr-only" />
                <Label
                  htmlFor="bia"
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    fileType === 'bia'
                      ? 'border-green-500 bg-green-50/50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className={`w-8 h-8 mb-2 ${fileType === 'bia' ? 'text-green-600' : 'text-gray-500'}`} />
                  <span className="font-semibold">Report BIA</span>
                </Label>
              </motion.div>
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Carica il tuo file</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`relative flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ease-in-out
                ${isDragActive ? 'border-purple-500 bg-purple-50/50' : 'border-gray-300 hover:border-gray-400'}
                ${isProcessing ? 'cursor-not-allowed bg-gray-100' : ''}`}
            >
              <input {...getInputProps()} disabled={isProcessing} />
              
              <AnimatePresence mode="wait">
                {isProcessing ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center flex flex-col items-center w-full"
                  >
                    <Loader2 className="w-12 h-12 mx-auto text-purple-600 animate-spin mb-4" />
                    <div className="w-full overflow-hidden px-2">
                      <p className="text-lg font-semibold text-purple-700">Elaborazione in corso...</p>
                      <p className="text-sm text-gray-600">
                        L'AI sta leggendo il tuo documento...
                      </p>
                      {uploadedFile && <p className="text-xs text-gray-500 mt-2 break-words">{uploadedFile.name}</p>}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center"
                  >
                    <UploadCloud className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-700">Trascina qui il file o clicca per selezionarlo</p>
                    <p className="text-sm text-gray-500">{dropzoneMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
};

export default FileUpload;