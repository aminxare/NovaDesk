'use client';

import React, { useState } from 'react';
import {
  PaintBrush20Regular,
  Desktop20Regular,
  Info20Regular,
  ArrowReset20Regular,
} from '@fluentui/react-icons';
import { useSystemStore } from '../../store/useSystemStore';
import { LivePreviewCard } from './settings/LivePreviewCard';
import { DesktopBackgroundSection } from './settings/DesktopBackgroundSection';
import { TaskbarColorSection } from './settings/TaskbarColorSection';
import { DisplaySection } from './settings/DisplaySection';
import { AboutSection } from './settings/AboutSection';

export const SettingsApp = () => {
  const { resetPersonalization } = useSystemStore();
  const [activeTab, setActiveTab] = useState<'personalization' | 'display' | 'about'>('personalization');
  const [notification, setNotification] = useState('');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2500);
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#0b1329] text-slate-100 select-none">
      {/* SIDEBAR */}
      <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-white/10 bg-[#080d1c]/80 flex flex-col p-3 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2.5 mb-3 rounded-2xl bg-white/5 border border-white/5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
            ND
          </div>
          <div>
            <div className="text-xs font-semibold text-white">NovaDesk</div>
            <div className="text-[10px] text-cyan-300 font-mono">Settings</div>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setActiveTab('personalization')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'personalization'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <PaintBrush20Regular />
            <span>Personalization</span>
          </button>
          <button
            onClick={() => setActiveTab('display')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'display'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Desktop20Regular />
            <span>Display</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === 'about'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Info20Regular />
            <span>About</span>
          </button>
        </nav>

        <div className="pt-2 border-t border-white/5 mt-auto">
          <button
            onClick={() => {
              resetPersonalization();
              showNotification('Restored default settings');
            }}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
          >
            <ArrowReset20Regular />
            <span>Reset Defaults</span>
          </button>
        </div>
      </aside>
      {/* MAIN VIEW */}
      <main className="flex-1 overflow-y-auto p-5 space-y-5">
        {notification && (
          <div className="fixed top-4 right-4 z-50 rounded-xl bg-cyan-500 text-slate-950 font-medium px-4 py-2 text-xs shadow-xl animate-fade-in">
            {notification}
          </div>
        )}

        {/* PERSONALIZATION VIEW */}
        {activeTab === 'personalization' && (
          <div className="space-y-4 max-w-4xl">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-white/10">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <PaintBrush20Regular className="text-cyan-400" />
                  Personalization
                </h1>
                <p className="text-xs text-slate-400">
                  Customize desktop background and taskbar color in real time.
                </p>
              </div>

              <button
                onClick={() => {
                  resetPersonalization();
                  showNotification('Defaults restored');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition"
              >
                <ArrowReset20Regular />
                <span>Reset Defaults</span>
              </button>
            </div>

            <LivePreviewCard />
            <DesktopBackgroundSection onNotify={showNotification} />
            <TaskbarColorSection onNotify={showNotification} />
          </div>
        )}

        {activeTab === 'display' && (
          <DisplaySection onGoToPersonalization={() => setActiveTab('personalization')} />
        )}

        {activeTab === 'about' && <AboutSection />}
      </main>
    </div>
  );
};