import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const WorkoutSessionContext = createContext();

export const useWorkoutSession = () => useContext(WorkoutSessionContext);

const initialState = {
  isActive: false,
  workoutType: null,
  sessionData: null,
  startTime: null,
  progress: {},
  lastUpdated: null,
};

export const WorkoutSessionProvider = ({ children }) => {
  const [session, setSessionState] = useState(initialState);
  const { user } = useAuth();

  const syncToSupabase = useCallback(async (sessionState) => {
    if (!user || !sessionState.isActive) return;
    try {
      await supabase
        .from('active_workouts')
        .upsert({
          user_id: user.id,
          workout_type: sessionState.workoutType,
          session_data: { ...sessionState.sessionData, progress: sessionState.progress },
          start_time: sessionState.startTime,
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error("Failed to sync workout session to Supabase:", error);
    }
  }, [user]);

  const setSession = useCallback((newSession) => {
    const sessionWithTimestamp = { ...newSession, lastUpdated: Date.now() };
    setSessionState(sessionWithTimestamp);
    if (newSession.isActive) {
      localStorage.setItem('jw-active-session', JSON.stringify(sessionWithTimestamp));
      syncToSupabase(sessionWithTimestamp);
    } else {
      localStorage.removeItem('jw-active-session');
    }
  }, [syncToSupabase]);

  const updateProgress = useCallback((progressUpdate) => {
    setSessionState(prev => {
      if (!prev.isActive) return prev;
      const newProgress = { ...prev.progress, ...progressUpdate };
      const newState = { ...prev, progress: newProgress, lastUpdated: Date.now() };
      localStorage.setItem('jw-active-session', JSON.stringify(newState));
      syncToSupabase(newState);
      return newState;
    });
  }, [syncToSupabase]);

  const clearSession = useCallback(async () => {
    setSessionState(initialState);
    localStorage.removeItem('jw-active-session');
    if (user) {
      try {
        await supabase.from('active_workouts').delete().eq('user_id', user.id);
      } catch (error) {
        console.error("Failed to clear session from Supabase:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            const rawSession = localStorage.getItem('jw-active-session');
            if(rawSession) {
                try {
                    const parsed = JSON.parse(rawSession);
                    const ONE_HOUR = 60 * 60 * 1000;
                    if (Date.now() - parsed.lastUpdated < ONE_HOUR) {
                        setSessionState(parsed);
                    } else {
                        clearSession();
                    }
                } catch (e) {
                    console.error("Failed to parse session from localStorage", e);
                    clearSession();
                }
            }
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [clearSession]);


  const value = {
    session,
    setSession,
    updateProgress,
    clearSession,
  };

  return (
    <WorkoutSessionContext.Provider value={value}>
      {children}
    </WorkoutSessionContext.Provider>
  );
};