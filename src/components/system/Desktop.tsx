'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSystemStore } from '../../store/useSystemStore';
import { Window } from '../shared/Window';
import { Taskbar } from './Taskbar';
import { StartMenu } from './StartMenu';
import { appsConfig } from '../../config/apps.config';
import { ContextMenu, ContextMenuItem } from '../shared/ContextMenu';
import { Folder20Regular, Document20Regular, ArrowClockwise20Regular } from '@fluentui/react-icons';
import { fileService } from '../../services/fileService';

export const Desktop = () => {
  const { openWindows, openApp, desktopBackground, loadSavedPersonalization } = useSystemStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

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

  const handleNewFolder = async () => {
    const name = prompt('Enter new folder name:', 'New Folder');
    if (!name) return;
    await fileService.createFolder(name, null);
    alert(`Created folder "${name}" in Dexie DB.`);
  };

  const handleNewFile = async () => {
    const name = prompt('Enter new file name:', 'notes.txt');
    if (!name) return;
    await fileService.createFile(name, 'documents', 'New file content');
    alert(`Created file "${name}" in Documents.`);
  };

  const desktopContextMenuItems: ContextMenuItem[] = [
    {
      label: 'New Folder',
      icon: <Folder20Regular className="h-4 w-4 text-amber-400" />,
      onClick: handleNewFolder,
    },
    {
      label: 'New File',
      icon: <Document20Regular className="h-4 w-4 text-cyan-400" />,
      onClick: handleNewFile,
    },
    {
      label: 'Refresh Desktop',
      icon: <ArrowClockwise20Regular className="h-4 w-4 text-slate-300" />,
      onClick: () => window.location.reload(),
    },
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none transition-all duration-300 ease-in-out"
      style={backgroundStyle}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
      onClick={() => setContextMenu(null)}
    >
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={desktopContextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Desktop Icons */}
      <div className="absolute inset-0 p-2 flex flex-col gap-2 content-start flex-wrap pt-4">
        {appsConfig.map((app) => (
          <button
            key={app.id}
            onDoubleClick={() => openApp(app)}
            className="flex flex-col items-center justify-start w-20 h-24 p-2 rounded hover:bg-white/10 text-white transition-colors group cursor-pointer"
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
