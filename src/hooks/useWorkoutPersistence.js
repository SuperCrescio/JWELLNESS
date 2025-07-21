import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { nativeBridge } from '@/lib/nativeBridge';
import { App as CapacitorApp } from '@capacitor/app';

export const useWorkoutPersistence = ({ workoutType, sessionData, startTimeProp, onExit }) => {
    const { user } = useAuth();
    const [time, setTime] = useState(0);

    const calculateElapsedTime = useCallback((startTime) => {
        if (!startTime) return 0;
        const start = new Date(startTime);
        const now = new Date();
        return Math.floor((now - start) / 1000);
    }, []);

    useEffect(() => {
        setTime(calculateElapsedTime(startTimeProp));
    }, [startTimeProp, calculateElapsedTime]);

    const showNotification = useCallback((timeLeft) => {
        const title = 'Allenamento in corso!';
        const body = timeLeft 
            ? `Tempo rimanente: ${Math.ceil(timeLeft / 60)} minuti` 
            : `Tempo trascorso: ${Math.floor(time / 60)} minuti`;

        if (nativeBridge.isNativeApp()) {
            nativeBridge.showNotification({ title, body });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: '/icon-192x192.png',
                    tag: 'workout-notification',
                    renotify: true,
                });
            });
        }
    }, [time]);
    
    const saveDataToDb = useCallback(async () => {
        if (!user || !startTimeProp) return;
        try {
            await supabase
                .from('active_workouts')
                .upsert({
                    user_id: user.id,
                    workout_type: workoutType,
                    session_data: sessionData,
                    start_time: startTimeProp,
                }, { onConflict: 'user_id' });
            localStorage.removeItem('activeWorkoutSession');
        } catch(e) {
            console.error("Failed to save session to Supabase, saving to localStorage instead.", e);
            const localData = {
                type: workoutType,
                data: sessionData,
                startTime: startTimeProp
            };
            localStorage.setItem('activeWorkoutSession', JSON.stringify(localData));
        }
    }, [user, startTimeProp, workoutType, sessionData]);


    useEffect(() => {
        const handleAppStateChange = (state) => {
             if (!state.isActive) { // App is going to background
                saveDataToDb();
                const timeLeft = sessionData.duration ? (sessionData.duration * 60) - time : null;
                showNotification(timeLeft);
            } else { // App is coming to foreground
                if (nativeBridge.isNativeApp()) {
                    nativeBridge.clearNotification();
                }
            }
        };

        const listener = CapacitorApp.addListener('appStateChange', handleAppStateChange);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                saveDataToDb();
                const timeLeft = sessionData.duration ? (sessionData.duration * 60) - time : null;
                showNotification(timeLeft);
            } else if (document.visibilityState === 'visible') {
                 if (!nativeBridge.isNativeApp() && 'Notification' in window) {
                    navigator.serviceWorker.ready.then(registration => {
                        registration.getNotifications({tag: 'workout-notification'}).then(notifications => {
                            notifications.forEach(notification => notification.close());
                        });
                    });
                }
            }
        };

        const handleBeforeUnload = (e) => {
            saveDataToDb();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        if (!nativeBridge.isNativeApp() && 'Notification' in window && Notification.permission !== 'granted') {
             Notification.requestPermission();
        }

        return () => {
            listener.remove();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [saveDataToDb, showNotification, sessionData, time]);

    return { time, setTime };
};