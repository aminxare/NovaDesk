'use client';

import React from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { useSystemStore, WindowState } from '../../store/useSystemStore';
import { Dismiss20Regular, Maximize20Regular, Subtract20Regular, SquareMultiple20Regular } from '@fluentui/react-icons';

interface WindowProps {
  app: WindowState;
}

export const Window: React.FC<WindowProps> = ({ app }) => {
  const { closeApp, minimizeApp, maximizeApp, restoreApp, focusApp, focusedWindow } = useSystemStore();
  const isFocused = focusedWindow === app.id;

  const handleDragStart = () => {
    focusApp(app.id);
  };

  if (app.isMinimized) return null;

  return (
    <Rnd
      default={{
        x: 100,
        y: 100,
        width: 800,
        height: 600,
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      dragHandleClassName="title-bar"
      onDragStart={handleDragStart}
      onMouseDown={() => focusApp(app.id)}
      style={{ zIndex: app.zIndex }}
      disableDragging={app.isMaximized}
      enableResizing={!app.isMaximized}
      className={`absolute ${app.isMaximized ? 'w-full! h-[calc(100%-48px)]! top-0! left-0! transform-none!' : ''}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={`flex flex-col w-full h-full bg-[#202020] rounded-xl overflow-hidden border border-white/10 shadow-2xl ${
          isFocused ? 'shadow-black/50' : 'shadow-black/30'
        } ${app.isMaximized ? 'rounded-none! border-none' : ''}`}
      >
        {/* Title Bar */}
        <div 
          className={`title-bar h-10 flex items-center justify-between select-none border-b px-3 transition-all ${
            isFocused ? 'border-white/10 bg-[#111827]/90' : 'border-white/5 bg-[#0f172a]/80'
          }`}
          onDoubleClick={() => app.isMaximized ? restoreApp(app.id) : maximizeApp(app.id)}
        >
          <div className="flex items-center gap-2.5 text-white text-sm font-medium">
            {app.icon && <span className="w-4 h-4 flex items-center justify-center text-cyan-300">{app.icon}</span>}
            <span>{app.title}</span>
          </div>

          <div className="flex h-full items-center gap-1">
            <button 
              onClick={() => minimizeApp(app.id)}
              className="h-7 w-7 rounded-md hover:bg-white/10 text-white transition-colors"
            >
              <Subtract20Regular />
            </button>
            <button 
              onClick={() => app.isMaximized ? restoreApp(app.id) : maximizeApp(app.id)}
              className="h-7 w-7 rounded-md hover:bg-white/10 text-white transition-colors"
            >
              {app.isMaximized ? <SquareMultiple20Regular /> : <Maximize20Regular />}
            </button>
            <button 
              onClick={() => closeApp(app.id)}
              className="h-7 w-7 rounded-md hover:bg-red-500 hover:text-white text-white transition-colors"
            >
              <Dismiss20Regular />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-[#0b1120] relative z-10">
          {app.content}
        </div>
      </motion.div>
    </Rnd>
  );
};
