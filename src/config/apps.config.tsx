import React from 'react';
import { Settings20Regular, Folder20Regular, Document20Regular, GlobeRegular, WindowConsole20Regular } from '@fluentui/react-icons';
import { TerminalApp } from '../components/apps/TerminalApp';
import { ExplorerApp } from '../components/apps/ExplorerApp';
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
    content: <ExplorerApp />
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
