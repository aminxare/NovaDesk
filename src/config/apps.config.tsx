import React from 'react';
import { Settings20Regular, Folder20Regular, Document20Regular, GlobeRegular, WindowConsole20Regular } from '@fluentui/react-icons';
import { TerminalApp } from '../components/apps/TerminalApp';
import { BrowserApp } from '../components/apps/BrowserApp';
import { SettingsApp } from '../components/apps/SettingsApp';
import { NotepadApp } from '../components/apps/NotepadApp';

export interface AppConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const appsConfig: AppConfig[] = [
  {
    id: 'settings',
    title: 'Settings',
    icon: <Settings20Regular />,
    content: <SettingsApp />
  },
  {
    id: 'explorer',
    title: 'File Explorer',
    icon: <Folder20Regular />,
    content: (
      <div className="h-full flex flex-col bg-[#eef2ff] text-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 bg-white/90 backdrop-blur-sm">
          <div className="text-sm text-slate-500">Quick access</div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">Home</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Documents</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Downloads</span>
          </div>
        </div>

        <div className="p-5 grid grid-cols-2 gap-4">
          {[
            { name: 'Projects', count: '12 items' },
            { name: 'Documents', count: '8 items' },
            { name: 'Pictures', count: '4 items' },
            { name: 'Downloads', count: '21 items' }
          ].map((folder) => (
            <div key={folder.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500">
                  <Folder20Regular className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">{folder.name}</div>
                  <div className="text-sm text-slate-500">{folder.count}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                <span>New file</span>
                <span>Recent</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'notepad',
    title: 'Notepad',
    icon: <Document20Regular />,
    content: <NotepadApp />
  },
  {
    id: 'browser',
    title: 'Browser',
    icon: <GlobeRegular />,
    content: <BrowserApp />
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: <WindowConsole20Regular />,
    content: <TerminalApp />
  }
];
