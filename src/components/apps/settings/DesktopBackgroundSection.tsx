'use client';

import React, { useState } from 'react';
import { Image20Regular, Checkmark20Regular, Link20Regular } from '@fluentui/react-icons';
import { useSystemStore } from '../../../store/useSystemStore';
import { WALLPAPER_PRESETS, SOLID_COLOR_PRESETS, GRADIENT_PRESETS } from '../../../config/personalization.config';

interface Props {
  onNotify: (msg: string) => void;
}

export const DesktopBackgroundSection: React.FC<Props> = ({ onNotify }) => {
  const { desktopBackground, setDesktopBackground } = useSystemStore();
  const [mode, setMode] = useState<'wallpapers' | 'colors' | 'gradients' | 'custom'>('wallpapers');
  const [customUrl, setCustomUrl] = useState('');
  const [customHex, setCustomHex] = useState('#0f172a');
  const [urlError, setUrlError] = useState('');

  const handleApplySolid = (hex: string) => {
    setCustomHex(hex);
    setDesktopBackground({ type: 'color', value: hex, name: `Solid (${hex})` });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#11192e]/90 p-4 sm:p-5 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Image20Regular className="text-cyan-400" />
            Desktop Background
          </h2>
          <p className="text-[11px] text-slate-400">Choose wallpapers, solid colors, gradients, or custom image URL.</p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
          {(['wallpapers', 'colors', 'gradients', 'custom'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium capitalize transition ${
                mode === m ? 'bg-cyan-500 text-slate-950 font-semibold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === 'wallpapers' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {WALLPAPER_PRESETS.map((wp) => {
            const isSel = desktopBackground.type === 'image' && desktopBackground.value === wp.url;
            return (
              <button
                key={wp.id}
                onClick={() => {
                  setDesktopBackground({ type: 'image', value: wp.url, name: wp.name });
                  onNotify(`Applied ${wp.name}`);
                }}
                className={`group relative h-24 rounded-2xl overflow-hidden border transition-all text-left flex flex-col justify-end p-2 ${
                  isSel ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url("${wp.thumbnail}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {isSel && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                    <Checkmark20Regular className="text-[10px]" />
                  </div>
                )}
                <span className="relative z-10 text-[11px] font-semibold text-white drop-shadow">{wp.name}</span>
              </button>
            );
          })}
        </div>
      )}
      {mode === 'colors' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SOLID_COLOR_PRESETS.map((col) => {
              const isSel = desktopBackground.type === 'color' && desktopBackground.value.toLowerCase() === col.value.toLowerCase();
              return (
                <button
                  key={col.name}
                  onClick={() => handleApplySolid(col.value)}
                  className={`relative h-16 rounded-2xl border p-2 flex flex-col justify-between transition-all ${
                    isSel ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow' : 'border-white/10 hover:border-white/30'
                  }`}
                  style={{ backgroundColor: col.value }}
                >
                  {isSel && (
                    <div className="self-end w-3.5 h-3.5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                      <Checkmark20Regular className="text-[9px]" />
                    </div>
                  )}
                  <span className="mt-auto text-[10px] font-medium text-slate-200 drop-shadow truncate w-full">{col.name}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-300">Custom Color:</span>
            <input
              type="color"
              value={customHex}
              onChange={(e) => handleApplySolid(e.target.value)}
              className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0"
            />
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-white/10 bg-[#080d1c] text-xs font-mono text-white outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => handleApplySolid(customHex)}
              className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {mode === 'gradients' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {GRADIENT_PRESETS.map((grad) => {
            const isSel = desktopBackground.type === 'gradient' && desktopBackground.value === grad.value;
            return (
              <button
                key={grad.name}
                onClick={() => {
                  setDesktopBackground({ type: 'gradient', value: grad.value, name: grad.name });
                  onNotify(`Applied ${grad.name}`);
                }}
                className={`relative h-20 rounded-2xl overflow-hidden border p-2.5 flex flex-col justify-between transition-all ${
                  isSel ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow' : 'border-white/10 hover:border-white/30'
                }`}
                style={{ background: grad.value }}
              >
                {isSel && (
                  <div className="self-end w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                    <Checkmark20Regular className="text-[10px]" />
                  </div>
                )}
                <span className="mt-auto text-xs font-semibold text-white drop-shadow">{grad.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {mode === 'custom' && (
        <div className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!customUrl.trim()) {
                setUrlError('Please enter an image URL');
                return;
              }
              setUrlError('');
              setDesktopBackground({ type: 'image', value: customUrl.trim(), name: 'Custom Wallpaper' });
              onNotify('Custom wallpaper applied');
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Link20Regular />
              </div>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setUrlError('');
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-2xl border border-white/10 bg-[#080d1c] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>
            <button type="submit" className="px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition">
              Apply Wallpaper
            </button>
          </form>
          {urlError && <p className="text-xs text-rose-400">{urlError}</p>}
        </div>
      )}
    </div>
  );
};