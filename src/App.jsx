import React, { useState, useEffect, useCallback } from 'react';
    import { Helmet } from 'react-helmet';
    import { Toaster } from '@/components/ui/toaster';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import AuthForm from '@/components/AuthForm';
    import AppContent from '@/components/AppContent';
    
    const App = () => {
      const { session: authSession, user, loading: authLoading } = useAuth();
      const { setSession, clearSession } = useWorkoutSession();
      const [userData, setUserData] = useState(null);
      const [biometricData, setBiometricData] = useState([]);
      const [isDataLoading, setIsDataLoading] = useState(true);
    
      useEffect(() => {
        if (!authLoading && user) {
          const rawSession = localStorage.getItem('jw-active-session');
          if (rawSession) {
            try {
              const parsedSession = JSON.parse(rawSession);
              const ONE_HOUR = 60 * 60 * 1000;
              if (Date.now() - parsedSession.lastUpdated < ONE_HOUR) {
                setSession(parsedSession);
              } else {
                clearSession();
              }
            } catch (e) {
              console.error("Failed to parse active session from localStorage", e);
              clearSession();
            }
          }
        }
      }, [authLoading, user, setSession, clearSession]);
    
      const fetchUserData = useCallback(async (retryCount = 0) => {
        if (!user) {
          setIsDataLoading(false);
          setUserData(null);
          setBiometricData([]);
          return;
        }
        setIsDataLoading(true);
        const defaultUserData = {
            plan_day_a: null, plan_day_b: null, plan_day_c: null, plan_day_d: null, plan_day_e: null, plan_day_f: null, plan_day_g: null,
            ai_plan_day_a: null, ai_plan_day_b: null, ai_plan_day_c: null, ai_plan_day_d: null, ai_plan_day_e: null, ai_plan_day_f: null, ai_plan_day_g: null,
            workout_plan: null, ai_workout_plan: null, bia_plan: null,
            nutrition_progress: [], workout_progress: [], bia_history: [], meditation_sessions: [],
            first_name: '', last_name: '', height_cm: null, weight_kg: null, date_of_birth: null,
        };
        try {
          const [userDataRes, biometricRes] = await Promise.all([
            supabase.from('user_data').select('*').eq('user_id', user.id).single(),
            supabase.from('biometric_data').select('*').eq('user_id', user.id)
          ]);
    
          const { data: userDataResult, error: userDataError } = userDataRes;
          const { data: biometricDataResult, error: biometricError } = biometricRes;
          
          if (userDataError && userDataError.code !== 'PGRST116') throw userDataError;
          if (biometricError) throw biometricError;
    
          setUserData({ ...defaultUserData, ...(userDataResult || {}) });
          setBiometricData(biometricDataResult || []);
    
        } catch (err) {
          console.error('Exception fetching user data:', err);
          setUserData(defaultUserData);
          setBiometricData([]);
        } finally {
          setIsDataLoading(false);
        }
      }, [user]);
    
      useEffect(() => {
        if (!authLoading && user) {
          fetchUserData();
        } else if (!authLoading && !user) {
          setIsDataLoading(false);
          setUserData(null);
          setBiometricData([]);
        }
      }, [authSession, user, authLoading, fetchUserData]);
    
      const updateUserData = useCallback(async (updates) => {
        if (!user) return;
        setUserData(prev => ({ ...prev, ...updates }));
        try {
          await supabase.from('user_data').update(updates).eq('user_id', user.id);
        } catch (err) {
          console.error('Exception updating user data:', err);
        }
      }, [user]);
    
      const renderContent = () => {
        if (authLoading || (isDataLoading && !userData)) {
          return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
            </div>
          );
        }
    
        if (!authSession || !user) {
          return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
                <AuthForm />
            </div>
          );
        }
    
        if (!userData) {
           return (
            <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600">Caricamento dati utente non riuscito.</p>
                <button onClick={() => fetchUserData()} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md">Riprova</button>
              </div>
            </div>
          );
        }
    
        return <AppContent userData={userData} biometricData={biometricData} updateUserData={updateUserData} fetchUserData={fetchUserData} />;
      };
    
      return (
        <>
          <Helmet>
            <title>WellnessTracker Pro - Il Tuo Compagno di Salute Completo</title>
            <meta name="description" content="App wellness completa per il controllo totale della tua salute, alimentazione e attività fisica con report professionali dettagliati." />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
          </Helmet>
          {renderContent()}
          <Toaster />
        </>
      );
    };
    
    export default App;