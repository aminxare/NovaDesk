'use client';

import React from 'react';
import { Info20Regular } from '@fluentui/react-icons';

export const AboutSection: React.FC = () => {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="pb-2 border-b border-white/10">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Info20Regular className="text-cyan-400" />
          About NovaDesk
        </h1>
        <p className="text-xs text-slate-400">Virtual desktop simulator specs and build information.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#11192e]/90 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-base font-bold shadow-md shadow-cyan-500/20">
            ND
          </div>
          <div>
            <div className="text-lg font-bold text-white">NovaDesk OS 11 Pro</div>
            <div className="text-xs text-cyan-300 font-mono">Version 2026.1 (Build 22000.1)</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Framework</span>
            <span className="text-white font-medium">Next.js 16 + React 19</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Styling</span>
            <span className="text-white font-medium">Tailwind CSS 4</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">State</span>
            <span className="text-white font-medium">Zustand 5</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Design</span>
            <span className="text-white font-medium">Fluent UI System</span>
          </div>
        </div>
      </div>
    </div>
  );
};