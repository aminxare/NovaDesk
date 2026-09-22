'use client';

import React, { useEffect, useMemo } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { Window } from '../shared/Window';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { appsConfig } from '../../config/apps.config';

export const Desktop = () => {
  const { openWindows, openApp, desktopBackground, loadSavedPersonalization } = useSystemStore();

  useEffect(() => {
    loadSavedPersonalization();
  }, [loadSavedPersonalization]);

  const backgroundStyle: React.CSSProperties = useMemo(() => {
    if (desktopBackground.type === 'image') {
      return {
        backgroundImage: `url("${desktopBackground.value}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0f172a',
      };
    }
    if (desktopBackground.type === 'gradient') {
      return {
        background: desktopBackground.value,
      };
    }
    return {
      backgroundColor: desktopBackground.value,
      backgroundImage: 'none',
    };
  }, [desktopBackground]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none transition-all duration-300 ease-in-out"
      style={backgroundStyle}
    >
      {/* Desktop Icons */}
      <div className="absolute inset-0 p-2 flex flex-col gap-2 content-start flex-wrap pt-4">
        {appsConfig.map((app) => (
          <button
            key={app.id}
            onDoubleClick={() => openApp(app)}
            className="flex flex-col items-center justify-start w-20 h-24 p-2 rounded hover:bg-white/10 text-white transition-colors group"
          >
            <div className="w-10 h-10 flex items-center justify-center text-blue-200 group-hover:text-white drop-shadow-md">
              {app.icon}
            </div>
            <span className="text-xs text-center mt-1 drop-shadow-md line-clamp-2 leading-tight">
              {app.title}
            </span>
          </button>
        ))}
      </div>

      {/* Open Windows */}
      {openWindows.map((app) => (
        <Window key={app.id} app={app} />
      ))}

      {/* Taskbar & Start Menu */}
      <StartMenu />
      <Taskbar />
    </div>
  );
};
