import React from 'react';
import { Settings20Regular, Folder20Regular, Document20Regular } from '@fluentui/react-icons';

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
    content: (
      <div className="p-4 text-white">
        <h2 className="text-2xl font-semibold mb-4">Settings</h2>
        <p>Windows 11 Settings Simulator</p>
      </div>
    )
  },
  {
    id: 'explorer',
    title: 'File Explorer',
    icon: <Folder20Regular />,
    content: (
      <div className="p-4 text-black bg-white h-full">
        <h2 className="text-2xl mb-4">File Explorer</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col items-center">
            <Folder20Regular className="text-yellow-500 w-12 h-12" />
            <span>Documents</span>
          </div>
          <div className="flex flex-col items-center">
            <Folder20Regular className="text-yellow-500 w-12 h-12" />
            <span>Downloads</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'notepad',
    title: 'Notepad',
    icon: <Document20Regular />,
    content: (
      <textarea 
        className="w-full h-full p-2 bg-white text-black outline-none resize-none" 
        placeholder="Type here..."
      />
    )
  }
];
