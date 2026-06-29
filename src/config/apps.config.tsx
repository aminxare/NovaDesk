import React from 'react';
import { Settings20Regular, Folder20Regular, Document20Regular, GlobeRegular, WindowConsole20Regular } from '@fluentui/react-icons';
import { TerminalApp } from '../components/apps/TerminalApp';
import { BrowserApp } from '../components/apps/BrowserApp';

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
      <div className="h-full flex flex-col gap-4 p-5 text-slate-100 bg-[#0f172a]">
        <div className="rounded-2xl border border-white/10 bg-[#111827]/80 p-4 shadow-lg shadow-black/20">
          <h2 className="text-2xl font-semibold mb-1">System settings</h2>
          <p className="text-sm text-slate-400">Browse and customize your desktop simulator experience.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { title: 'Display', description: 'Appearance, theme & volume' },
            { title: 'Network', description: 'Wi-Fi, Bluetooth & proxy' },
            { title: 'Personalization', description: 'Wallpaper, colors & lock screen' },
            { title: 'Privacy', description: 'Permissions and security' }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-[#141b2e]/90 p-4 hover:bg-[#1d283f]/90 transition-colors">
              <div className="text-sm uppercase text-cyan-300 tracking-[0.18em] mb-3">{item.title}</div>
              <p className="text-sm text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827]/80 p-4 flex flex-col gap-3">
          <div className="text-sm uppercase text-slate-400">Quick actions</div>
          <div className="grid grid-cols-3 gap-3">
            {['Update', 'Accessibility', 'System info'].map((option) => (
              <button key={option} className="rounded-2xl border border-white/10 bg-white/5 py-3 text-left text-sm text-slate-200 hover:bg-cyan-500/10 transition-colors">
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
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
    content: (
      <div className="h-full flex flex-col bg-[#0f172a] text-slate-100">
        <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between bg-[#111827]/90">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Untitled document</div>
            <div className="text-base font-medium">Notepad</div>
          </div>
          <button className="rounded-full border border-white/10 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 hover:bg-cyan-500/15 transition-colors">
            Save
          </button>
        </div>
        <textarea
          className="flex-1 w-full resize-none border-none bg-transparent p-5 text-sm leading-6 text-slate-100 outline-none"
          placeholder="Start writing some notes..."
        />
      </div>
    )
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
