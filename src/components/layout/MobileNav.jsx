import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Apple, Dumbbell, BarChart3, Upload } from 'lucide-react';

const mainNavigation = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity, path: '/dashboard' },
  { id: 'nutrition', label: 'Alimenti', icon: Apple, path: '/nutrition' },
  { id: 'workout', label: 'Workout', icon: Dumbbell, path: '/workout' },
  { id: 'reports', label: 'Report', icon: BarChart3, path: '/reports' },
  { id: 'upload', label: 'Carica', icon: Upload, path: '/upload' }
];

const MobileNav = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isLikelyKeyboard = window.innerHeight < window.screen.height * 0.75;
      setIsKeyboardVisible(isLikelyKeyboard);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AnimatePresence>
      {!isKeyboardVisible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-lg border-t border-gray-200/80 shadow-t-lg z-40 p-safe"
        >
          <nav className="flex justify-around items-center h-16">
            {mainNavigation.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={`mobile-${item.id}`}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                      isActive ? 'text-purple-600' : 'text-gray-500'
                    }`
                  }
                >
                  <Icon className="w-6 h-6" />
                </NavLink>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;