'use client';

import React, { useState } from 'react';
import {
  ArrowLeft20Regular,
  ArrowRight20Regular,
  ArrowClockwise20Regular,
  Home20Regular,
  LockClosed20Regular,
  Shield20Regular,
  Star20Regular,
  Star20Filled,
  Open20Regular,
  Dismiss20Regular,
  Search20Regular,
} from '@fluentui/react-icons';
import { BrowserTab, SearchEngineId } from '../../../types/browser';
import { SEARCH_ENGINES } from '../../../config/browser.config';

interface NavigationBarProps {
  activeTab: BrowserTab;
  searchEngineId: SearchEngineId;
  isBookmarked: boolean;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onHome: () => void;
  onToggleBookmark: () => void;
  onChangeSearchEngine: (engineId: SearchEngineId) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  searchEngineId,
  isBookmarked,
  onNavigate,
  onBack,
  onForward,
  onReload,
  onHome,
  onToggleBookmark,
  onChangeSearchEngine,
}) => {
  const [addressInput, setAddressInput] = useState(
    activeTab.url === 'novadesk://newtab' ? '' : activeTab.url
  );

  const canGoBack = activeTab.historyIndex > 0;
  const canGoForward = activeTab.historyIndex < activeTab.history.length - 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) {
      onHome();
      return;
    }
    onNavigate(addressInput.trim());
  };

  const handleOpenExternal = () => {
    if (activeTab.url && !activeTab.url.startsWith('novadesk://')) {
      window.open(activeTab.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-[#0f172a] px-3 py-2 border-b border-white/10 text-slate-200">
      <div className="flex items-center gap-1">
        <button onClick={onBack} disabled={!canGoBack} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition">
          <ArrowLeft20Regular />
        </button>
        <button onClick={onForward} disabled={!canGoForward} className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 transition">
          <ArrowRight20Regular />
        </button>
        <button onClick={onReload} className="p-1.5 rounded-lg hover:bg-white/10 transition">
          <ArrowClockwise20Regular className={activeTab.isLoading ? 'animate-spin' : ''} />
        </button>
        <button onClick={onHome} className="p-1.5 rounded-lg hover:bg-white/10 transition">
          <Home20Regular />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 min-w-[200px]">
        <div className="flex items-center h-8 px-3 rounded-full border border-white/15 bg-[#141e33] hover:border-white/25 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all">
          <div className="mr-2 text-slate-400 shrink-0">
            {activeTab.url.startsWith('https://') ? (
              <LockClosed20Regular className="w-3.5 h-3.5 text-emerald-400" />
            ) : activeTab.url.startsWith('novadesk://') ? (
              <Shield20Regular className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Search20Regular className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>

          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder={`Search ${SEARCH_ENGINES[searchEngineId].name} or type URL`}
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 outline-none font-mono"
            spellCheck={false}
          />

          {addressInput && (
            <button type="button" onClick={() => setAddressInput('')} className="p-1 text-slate-400 hover:text-white transition">
              <Dismiss20Regular className="w-3 h-3" />
            </button>
          )}

          <button type="button" onClick={onToggleBookmark} className="ml-1 p-1 text-slate-400 hover:text-amber-400 transition">
            {isBookmarked ? <Star20Filled className="w-3.5 h-3.5 text-amber-400" /> : <Star20Regular className="w-3.5 h-3.5" />}
          </button>
        </div>
      </form>

      <div className="flex items-center gap-1.5 shrink-0">
        <select
          value={searchEngineId}
          onChange={(e) => onChangeSearchEngine(e.target.value as SearchEngineId)}
          className="h-8 px-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-200 outline-none cursor-pointer"
        >
          <option value="google" className="bg-slate-900">Google</option>
          <option value="duckduckgo" className="bg-slate-900">DuckDuckGo</option>
          <option value="bing" className="bg-slate-900">Bing</option>
          <option value="wikipedia" className="bg-slate-900">Wikipedia</option>
        </select>

        {activeTab.url && !activeTab.url.startsWith('novadesk://') && (
          <button
            onClick={handleOpenExternal}
            className="flex items-center gap-1 h-8 px-2.5 rounded-xl border border-white/10 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium transition"
          >
            <Open20Regular className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Native</span>
          </button>
        )}
      </div>
    </div>
  );
};

