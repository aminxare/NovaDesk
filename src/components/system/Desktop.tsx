'use client';

import { useSystemStore } from '../../store/useSystemStore';
import { Window } from '../shared/Window';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { appsConfig } from '../../config/apps.config';

export const Desktop = () => {
  const { openWindows, openApp } = useSystemStore();

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-blue-900 bg-[url('https://images.unsplash.com/photo-1618172193622-ae2d025f4032?ixlib=rb-4.0.3&auto=format&fit=crop&w=3840&q=80')] bg-cover bg-center">
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
