import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Activity, Apple, Dumbbell, BarChart3, Upload, LogOut, User as UserIcon, BrainCircuit } from 'lucide-react';

const sidebarNavigation = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity, path: '/dashboard' },
  { id: 'nutrition', label: 'Alimenti', icon: Apple, path: '/nutrition' },
  { id: 'workout', label: 'Workout', icon: Dumbbell, path: '/workout' },
  { id: 'meditation', label: 'Meditazione', icon: BrainCircuit, path: '/meditation' },
  { id: 'reports', label: 'Report', icon: BarChart3, path: '/reports' },
  { id: 'upload', label: 'Carica', icon: Upload, path: '/upload' },
  { id: 'profile', label: 'Utente', icon: UserIcon, path: '/profile' }
];

const Sidebar = ({ closeSidebar }) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed lg:relative z-50 lg:z-auto w-64 min-h-screen bg-white border-r border-gray-200/80 p-4 flex flex-col"
    >
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold gradient-text">JWellness - WellnessTracker</h1>
        <p className="text-sm text-gray-600 mt-1">Il tuo compagno di salute</p>
      </div>
      <nav className="space-y-2 flex-grow">
        {sidebarNavigation.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => {
                if (closeSidebar) closeSidebar();
              }}
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-200/50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Esci</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;