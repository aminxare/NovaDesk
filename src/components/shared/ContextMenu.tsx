'use client';

import React, { useEffect } from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="fixed z-50 min-w-[190px] rounded-xl bg-[#0f172a]/95 border border-white/10 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 text-xs text-slate-200"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, idx) => (
        <button
          key={idx}
          disabled={item.disabled}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          className={`flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-left transition-colors cursor-pointer ${
            item.disabled
              ? 'opacity-40 cursor-not-allowed'
              : item.danger
              ? 'hover:bg-rose-500/20 text-rose-300 hover:text-rose-200'
              : 'hover:bg-white/10 hover:text-white'
          }`}
        >
          {item.icon && <span className="text-cyan-400">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};
