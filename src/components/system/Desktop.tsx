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
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

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
        setSelectedAppId(null);
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
      onClick={() => {
        setContextMenu(null);
        setSelectedAppId(null);
      }}
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
      <div className="absolute inset-0 flex flex-col content-start flex-wrap gap-3 p-3 pt-5">
        {appsConfig.map((app) => (
          <button
            key={app.id}
            type="button"
            title={`Open ${app.title}`}
            aria-label={`Open ${app.title}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAppId(app.id);
            }}
            onDoubleClick={() => openApp(app)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openApp(app);
              }
            }}
            className={`group flex h-24 w-24 cursor-pointer flex-col items-center justify-start gap-1 rounded-lg px-1.5 pb-2 pt-1.5 text-center outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-cyan-300/80 ${
              selectedAppId === app.id
                ? 'bg-cyan-400/10 ring-1 ring-inset ring-cyan-300/30'
                : 'hover:bg-white/[0.05]'
            }`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-slate-950/25 shadow-sm shadow-black/20 backdrop-blur-sm transition-colors duration-150 group-hover:bg-slate-950/40 ${
                selectedAppId === app.id ? 'border-cyan-300/35' : 'border-white/10'
              }`}
            >
              <span className="flex items-center justify-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] [&>svg]:h-7 [&>svg]:w-7">
                {app.icon}
              </span>
            </div>
            <span
              className={`line-clamp-2 max-w-full rounded-sm px-1 py-0.5 text-xs font-medium leading-tight text-white transition-colors [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] group-hover:bg-slate-950/55 ${
                selectedAppId === app.id ? 'bg-slate-950/55' : 'bg-transparent'
              }`}
            >
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
