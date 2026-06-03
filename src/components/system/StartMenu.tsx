'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemStore } from '../../store/useSystemStore';
import { appsConfig } from '../../config/apps.config';
import { Search20Regular, Power20Regular } from '@fluentui/react-icons';

export const StartMenu = () => {
  const { isStartMenuOpen, closeStartMenu, openApp } = useSystemStore();

  return (
    <AnimatePresence>
      {isStartMenuOpen && (
        <>
          {/* Invisible backdrop to close menu when clicking outside */}
          <div 
            className="absolute inset-0 z-40"
            onClick={closeStartMenu}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[640px] h-[720px] bg-[#242424]/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-white/10 z-50 flex flex-col p-8"
          >
            {/* Search Bar */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/50">
                <Search20Regular />
              </div>
              <input
                type="text"
                placeholder="Type here to search"
                className="w-full bg-[#1c1c1c] border-b-2 border-[#1c1c1c] focus:border-blue-500 rounded-full py-2 pl-12 pr-4 text-white placeholder-white/50 outline-none transition-colors"
              />
            </div>

            {/* Pinned Apps */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-white font-semibold">Pinned</h3>
                <button className="text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors">
                  All apps &gt;
                </button>
              </div>
              
              <div className="grid grid-cols-6 gap-4">
                {appsConfig.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      openApp(app);
                      closeStartMenu();
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-2 rounded hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center text-white">
                      {app.icon}
                    </div>
                    <span className="text-xs text-white text-center truncate w-full">{app.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Profile / Power */}
            <div className="h-16 mt-auto -mx-8 -mb-8 px-8 bg-black/20 flex items-center justify-between rounded-b-xl border-t border-white/5">
              <div className="flex items-center gap-3 hover:bg-white/10 p-2 rounded cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                  USER
                </div>
                <span className="text-white text-sm">User</span>
              </div>
              
              <button className="w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 text-white transition-colors">
                <Power20Regular />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
