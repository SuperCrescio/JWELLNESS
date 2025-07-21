import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, Wand2, Moon, Dumbbell, Droplets, Brain } from 'lucide-react';
import { filterDataByDateRange } from '@/lib/dateUtils';

const AiRecommendations = ({ userData }) => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user || !userData || !userData.first_name) {
                setLoading(false);
                return;
            };
            
            setLoading(true);

            try {
                const { data: biometricCount, error: dbError } = await supabase
                    .from('biometric_data')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                if (dbError) throw dbError;
                
                if (biometricCount.count === 0) {
                    setLoading(false);
                    return; 
                }

                 const { data: biometricData, error: dataFetchError } = await supabase
                    .from('biometric_data')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('recorded_at', { ascending: false })
                    .limit(500);

                if (dataFetchError) throw dataFetchError;

                const userName = userData.first_name;
                const dateRange = 'last7days';

                const holisticData = {
                    biometricData,
                    userName,
                    nutritionData: filterDataByDateRange(userData.nutrition_progress, dateRange, 'date'),
                    workoutData: filterDataByDateRange(userData.workout_progress, dateRange, 'date'),
                    biaData: filterDataByDateRange(userData.bia_history, dateRange, 'patientInfo.testDate'),
                    meditationData: filterDataByDateRange(userData.meditation_sessions, dateRange, 'timestamp'),
                };

                const { data: reportData, error: functionError } = await supabase.functions.invoke('analyze-biometrics', {
                    body: JSON.stringify(holisticData),
                });

                if (functionError) throw new Error(functionError.message);
                if (reportData.error) throw new Error(reportData.error);
                
                if (reportData.aiRecommendations) {
                    setRecommendations(reportData.aiRecommendations);
                }

            } catch (e) {
                console.error("Error fetching AI recommendations:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user, userData]);

    const getRecommendationIcon = (icon) => {
        switch (icon) {
            case 'sleep': return <Moon className="w-5 h-5 text-indigo-500"/>;
            case 'consistency': return <Dumbbell className="w-5 h-5 text-blue-500"/>;
            case 'hydration': return <Droplets className="w-5 h-5 text-cyan-500"/>;
            case 'rest': return <Brain className="w-5 h-5 text-purple-500"/>;
            default: return <Brain className="w-5 h-5 text-gray-500"/>;
        }
    };
    
    if (loading) {
        return (
            <Card className="p-4 glass-effect border-0 flex items-center gap-4">
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                <p className="text-sm text-gray-600">Il Coach AI sta analizzando i tuoi dati...</p>
            </Card>
        );
    }

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <Card className="p-4 sm:p-6 glass-effect border-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Wand2 className="w-5 h-5 mr-2 text-purple-500"/>
                Consigli dal tuo Coach AI
            </h3>
            <ul className="space-y-3">
                {recommendations.slice(0, 3).map(rec => (
                     <li key={rec.id} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                        <div className="p-2 bg-white rounded-full">{getRecommendationIcon(rec.icon)}</div>
                        <p className="text-sm text-gray-700 flex-1">{rec.recommendation}</p>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default AiRecommendations;