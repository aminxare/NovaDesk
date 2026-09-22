/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Add20Regular, Dismiss20Regular, Globe20Regular } from '@fluentui/react-icons';
import { BrowserTab } from '../../../types/browser';
import { getFaviconUrl } from '../../../config/browser.config';

interface TabBarProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  return (
    <div className="flex items-center gap-1 bg-[#09101d] px-2 pt-2 border-b border-white/10 select-none overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const faviconUrl = tab.url.startsWith('novadesk://') ? null : getFaviconUrl(tab.url);

        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative flex items-center gap-2 h-9 max-w-[210px] min-w-[120px] px-3 rounded-t-xl text-xs transition-all cursor-pointer border-t border-x ${
              isActive
                ? 'bg-[#0f172a] text-white border-white/15 shadow-md shadow-black/30 font-medium'
                : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10 hover:text-slate-200'
            }`}
          >
            {/* Favicon or Loader */}
            {tab.isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : faviconUrl ? (
              <img
                src={faviconUrl}
                alt=""
                className="w-3.5 h-3.5 shrink-0 rounded-xs object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe20Regular className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
            )}

            {/* Title */}
            <span className="truncate flex-1 pr-1">{tab.title || 'New Tab'}</span>

            {/* Close Button */}
            <button
              onClick={(e) => onCloseTab(tab.id, e)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/20 transition opacity-80 group-hover:opacity-100"
              title="Close Tab"
            >
              <Dismiss20Regular className="w-3 h-3" />
            </button>

            {/* Bottom active indicator highlight line */}
            {isActive && (
              <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-cyan-400 rounded-full" />
            )}
          </div>
        );
      })}

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition ml-1 shrink-0"
        title="Open New Tab"
      >
        <Add20Regular className="w-4 h-4" />
      </button>
    </div>
  );
};
