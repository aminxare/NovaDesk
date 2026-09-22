'use client';

import React, { useMemo } from 'react';
import { useSystemStore } from '../../../store/useSystemStore';

export const LivePreviewCard: React.FC = () => {
  const { desktopBackground, taskbarColor } = useSystemStore();

  const previewBgStyle: React.CSSProperties = useMemo(() => {
    if (desktopBackground.type === 'image') {
      return {
        backgroundImage: `url("${desktopBackground.value}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0f172a',
      };
    }
    if (desktopBackground.type === 'gradient') {
      return { background: desktopBackground.value };
    }
    return { backgroundColor: desktopBackground.value, backgroundImage: 'none' };
  }, [desktopBackground]);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#11192e]/90 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-2 text-[11px] uppercase tracking-wider text-slate-400 font-medium">
        <span>Interactive Live Preview</span>
        <span className="text-cyan-300 font-mono normal-case">
          {desktopBackground.name || desktopBackground.type} • Taskbar: {taskbarColor}
        </span>
      </div>

      <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-white/15 shadow-inner flex flex-col justify-between">
        <div className="absolute inset-0 transition-all duration-300" style={previewBgStyle} />

        {/* Mini desktop icons */}
        <div className="relative p-2 flex flex-col gap-1 z-10 w-20 pointer-events-none">
          <div className="flex items-center gap-1 p-1 rounded bg-black/40 backdrop-blur-xs text-[9px] text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
            <span className="truncate">Settings</span>
          </div>
          <div className="flex items-center gap-1 p-1 rounded bg-black/40 backdrop-blur-xs text-[9px] text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="truncate">Browser</span>
          </div>
        </div>

        {/* Centered Sample Window */}
        <div className="relative self-center my-auto z-10 w-40 sm:w-52 rounded-lg overflow-hidden border border-white/20 bg-slate-900/80 backdrop-blur-md shadow-2xl pointer-events-none">
          <div className="h-4 bg-slate-800/90 border-b border-white/10 px-2 flex items-center justify-between text-[8px] text-slate-300">
            <span>NovaDesk Window</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            </div>
          </div>
          <div className="p-2 text-[9px] text-slate-300">
            Mode: <span className="text-cyan-300 font-semibold">{desktopBackground.type}</span>
          </div>
        </div>

        {/* Simulated Taskbar */}
        <div
          className="relative w-full h-7 backdrop-blur-md border-t border-white/15 flex items-center justify-between px-3 z-10 transition-colors duration-300"
          style={{ background: taskbarColor }}
        >
          <div className="flex items-center gap-2 mx-auto">
            <div className="w-3.5 h-3.5 rounded flex items-center justify-center bg-cyan-500/20 text-cyan-300 text-[8px]">
              ❖
            </div>
            <div className="w-3 h-3 rounded bg-white/20" />
            <div className="w-3 h-3 rounded bg-cyan-400/30" />
            <div className="w-3 h-3 rounded bg-white/20" />
          </div>
          <div className="text-[8px] text-slate-300 font-mono">12:00 PM</div>
        </div>
      </div>
    </div>
  );
};