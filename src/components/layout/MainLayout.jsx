import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    const handleBackButton = (e) => {
      e.preventDefault();
    };
    const listener = CapacitorApp.addListener('backButton', handleBackButton);
    return () => {
        listener.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent w-full">
      <div className="flex w-full">
        <div className="hidden lg:flex">
          <Sidebar />
        </div>
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
              <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
            </>
          )}
        </AnimatePresence>
        <main className="flex-1 p-safe py-6 lg:py-8 w-full overflow-y-auto bg-neutral-100">
          <div className="lg:hidden flex items-center justify-between mb-6 px-4 sm:px-6">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="-ml-3" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-6 h-6 text-gray-700" />
              </Button>
              <h1 className="text-xl font-bold gradient-text ml-2">JWellness</h1>
            </div>
          </div>
          <div className="pb-28 lg:pb-0 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default MainLayout;