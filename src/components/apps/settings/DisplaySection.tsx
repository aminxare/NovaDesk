'use client';

import React from 'react';
import { Desktop20Regular, Image20Regular, ColorBackground20Regular } from '@fluentui/react-icons';

interface Props {
  onGoToPersonalization: () => void;
}

export const DisplaySection: React.FC<Props> = ({ onGoToPersonalization }) => {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="pb-2 border-b border-white/10">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Desktop20Regular className="text-cyan-400" />
          Display & System
        </h1>
        <p className="text-xs text-slate-400">Resolution, scaling, and display settings.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-[#11192e]/90 p-4 space-y-1">
          <div className="text-[11px] text-cyan-300 uppercase tracking-wider font-semibold">Resolution</div>
          <div className="text-lg font-bold text-white">Full Screen Viewport</div>
          <p className="text-xs text-slate-400">100vw × 100vh dynamic responsive</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#11192e]/90 p-4 space-y-1">
          <div className="text-[11px] text-cyan-300 uppercase tracking-wider font-semibold">Scale</div>
          <div className="text-lg font-bold text-white">100% (Recommended)</div>
          <p className="text-xs text-slate-400">Fluent UI system scaling</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#11192e]/90 p-4 space-y-3">
        <div className="text-xs font-semibold text-white">Personalization Shortcuts</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={onGoToPersonalization}
            className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-medium text-white">Change Desktop Wallpaper</div>
              <div className="text-[10px] text-slate-400">Curated wallpapers, colors, gradients</div>
            </div>
            <Image20Regular className="text-cyan-400 text-base" />
          </button>

          <button
            onClick={onGoToPersonalization}
            className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-medium text-white">Change Taskbar Color</div>
              <div className="text-[10px] text-slate-400">Glass acrylic tint & transparency</div>
            </div>
            <ColorBackground20Regular className="text-cyan-400 text-base" />
          </button>
        </div>
      </div>
    </div>
  );
};