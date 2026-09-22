'use client';

import React, { useEffect, useState } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { appsConfig } from '../../config/apps.config';
import { Wifi420Regular, Speaker220Regular, Battery520Regular } from '@fluentui/react-icons';
import { format } from 'date-fns';

export const Taskbar = () => {
  const { openWindows, toggleStartMenu, isStartMenuOpen, openApp, focusedWindow, taskbarColor } = useSystemStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="absolute bottom-0 left-0 w-full h-12 backdrop-blur-md border-t border-white/10 flex items-center justify-between px-2 z-50 transition-colors duration-300"
      style={{ background: taskbarColor }}
    >
      <div className="flex-1 flex justify-center items-center gap-1">
        {/* Start Button */}
        <button
          onClick={toggleStartMenu}
          className={`w-10 h-10 flex items-center justify-center rounded transition-colors ${
            isStartMenuOpen ? 'bg-white/10' : 'hover:bg-white/10'
          }`}
        >
          <svg viewBox="0 0 88 88" className="w-6 h-6">
            <path fill="#00a4ef" d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L0 75.497V46.06zM39.545 6.774L87.876 0v41.527l-48.331.414zM87.876 45.549L88 87.33l-48.455-6.678V45.892z"/>
          </svg>
        </button>

        {/* Pinned Apps / Open Apps */}
        {appsConfig.map((app) => {
          const isOpen = openWindows.some((w) => w.id === app.id);
          const isFocused = focusedWindow === app.id;

          return (
            <button
              key={app.id}
              onClick={() => openApp(app)}
              className={`w-10 h-10 flex flex-col items-center justify-center rounded relative transition-colors ${
                isFocused ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              title={app.title}
            >
              <div className="w-6 h-6 flex items-center justify-center text-white">
                {app.icon}
              </div>
              {isOpen && (
                <div 
                  className={`absolute bottom-0 h-1 rounded-full transition-all ${
                    isFocused ? 'w-4 bg-blue-400' : 'w-2 bg-gray-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* System Tray */}
      <div className="flex items-center h-full text-white text-xs gap-2 px-2 hover:bg-white/10 rounded transition-colors cursor-default">
        <div className="flex items-center gap-2">
          <Wifi420Regular />
          <Speaker220Regular />
          <Battery520Regular />
        </div>
        <div className="flex flex-col items-end justify-center ml-2">
          <span>{format(time, 'h:mm a')}</span>
          <span>{format(time, 'M/d/yyyy')}</span>
        </div>
      </div>
    </div>
  );
};
