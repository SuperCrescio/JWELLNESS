import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkoutSession } from '@/contexts/WorkoutSessionContext';
import MainLayout from '@/components/layout/MainLayout';

const Dashboard = lazy(() => import('@/components/Dashboard'));
const NutritionTracker = lazy(() => import('@/components/NutritionTracker'));
const WorkoutTracker = lazy(() => import('@/components/WorkoutTracker'));
const Meditation = lazy(() => import('@/components/Meditation'));
const Reports = lazy(() => import('@/components/Reports'));
const FileUpload = lazy(() => import('@/components/FileUpload'));
const UserProfile = lazy(() => import('@/components/UserProfile'));

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
  </div>
);

const AppContent = ({ userData, biometricData, updateUserData, fetchUserData }) => {
  const { session: workoutSession } = useWorkoutSession();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (workoutSession.isActive && location.pathname !== '/workout') {
      navigate('/workout');
    }
  }, [workoutSession.isActive, location.pathname, navigate]);

  return (
    <MainLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Routes location={location}>
              <Route path="/" element={<Dashboard userData={userData} />} />
              <Route path="/dashboard" element={<Dashboard userData={userData} />} />
              <Route path="/nutrition" element={<NutritionTracker userData={userData} updateUserData={updateUserData} />} />
              <Route path="/workout" element={<WorkoutTracker userData={userData} updateUserData={updateUserData} />} />
              <Route path="/meditation" element={<Meditation userData={userData} updateUserData={updateUserData} />} />
              <Route path="/reports" element={<Reports userData={userData} biometricData={biometricData} />} />
              <Route path="/upload" element={<FileUpload userData={userData} updateUserData={updateUserData} />} />
              <Route path="/profile" element={<UserProfile userData={userData} updateUserData={updateUserData} userEmail={userData.email} onSyncComplete={fetchUserData} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </MainLayout>
  );
};

export default AppContent;