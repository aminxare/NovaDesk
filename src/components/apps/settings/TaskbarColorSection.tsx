'use client';

import React, { useMemo, useState } from 'react';
import { ColorBackground20Regular, Checkmark20Regular } from '@fluentui/react-icons';
import { useSystemStore } from '../../../store/useSystemStore';
import { TASKBAR_PRESETS, hexToRgba, parseRgbaOrHex } from '../../../config/personalization.config';

interface Props {
  onNotify: (msg: string) => void;
}

export const TaskbarColorSection: React.FC<Props> = ({ onNotify }) => {
  const { taskbarColor, setTaskbarColor } = useSystemStore();

  const parsed = useMemo(() => parseRgbaOrHex(taskbarColor), [taskbarColor]);
  const [baseColor, setBaseColor] = useState(parsed.hex);
  const [opacity, setOpacity] = useState(Math.round(parsed.alpha * 100));

  const handleChange = (hex: string, op: number) => {
    setBaseColor(hex);
    setOpacity(op);
    setTaskbarColor(hexToRgba(hex, op / 100));
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#11192e]/90 p-4 sm:p-5 shadow-xl space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <ColorBackground20Regular className="text-cyan-400" />
          Taskbar Background Color
        </h2>
        <p className="text-[11px] text-slate-400">Customize taskbar tint, opacity, and translucent acrylic blur effect.</p>
      </div>

      {/* Active Color Chip */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs">
        <span className="text-slate-300">Active Taskbar Color:</span>
        <div className="flex items-center gap-2 font-mono">
          <span className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs" style={{ background: taskbarColor }} />
          <span className="text-cyan-300 font-semibold">{taskbarColor}</span>
        </div>
      </div>

      {/* Presets Grid */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Color Presets</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TASKBAR_PRESETS.map((preset) => {
            const isSel = taskbarColor.replace(/\s+/g, '') === preset.value.replace(/\s+/g, '');
            return (
              <button
                key={preset.name}
                onClick={() => {
                  setTaskbarColor(preset.value);
                  const p = parseRgbaOrHex(preset.value);
                  setBaseColor(p.hex);
                  setOpacity(Math.round(p.alpha * 100));
                  onNotify(`Selected ${preset.name}`);
                }}
                className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                  isSel ? 'border-cyan-400 ring-2 ring-cyan-400/50 bg-white/10 shadow' : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-lg border border-white/30 shadow-xs" style={{ background: preset.value }} />
                  {isSel && <Checkmark20Regular className="text-cyan-400 text-xs" />}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white leading-tight">{preset.name}</div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">{preset.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Picker and Slider */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-3">
        <div className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Custom Tint & Opacity</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Base Tint Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={baseColor}
                onChange={(e) => handleChange(e.target.value, opacity)}
                className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0"
              />
              <input
                type="text"
                value={baseColor}
                onChange={(e) => handleChange(e.target.value, opacity)}
                className="flex-1 px-2.5 py-1 rounded-xl border border-white/10 bg-[#080d1c] text-xs font-mono text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <label className="text-slate-400">Opacity</label>
              <span className="font-mono text-cyan-300 font-semibold">{opacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={opacity}
              onChange={(e) => handleChange(baseColor, parseInt(e.target.value, 10))}
              className="w-full h-1.5 rounded-lg bg-slate-700 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};