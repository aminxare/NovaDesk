/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Search20Regular, Globe20Regular, History20Regular, Dismiss20Regular } from '@fluentui/react-icons';
import { HistoryItem, SearchEngineId } from '../../../types/browser';
import { POPULAR_SHORTCUTS, SEARCH_ENGINES, getFaviconUrl } from '../../../config/browser.config';

interface NewTabPageProps {
  searchEngineId: SearchEngineId;
  history: HistoryItem[];
  onNavigate: (url: string) => void;
  onClearHistory: () => void;
}

export const NewTabPage: React.FC<NewTabPageProps> = ({
  searchEngineId,
  history,
  onNavigate,
  onClearHistory,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const engine = SEARCH_ENGINES[searchEngineId];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    onNavigate(searchInput.trim());
  };

  const trendingTopics = ['React 19', 'Next.js 16', 'Tailwind CSS', 'AI Tools'];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#09111e] via-[#0d1829] to-[#070e1a] text-slate-100 p-5 sm:p-8 space-y-6">
      <div className="max-w-2xl mx-auto text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-cyan-300 font-medium">
          <Globe20Regular className="w-4 h-4 text-cyan-400" />
          <span>Powered by {engine.name}</span>
        </div>

        <h1 className="text-2xl font-extrabold text-white">Search or type a URL</h1>

        <form onSubmit={handleSearchSubmit}>
          <div className="flex items-center h-10 px-3.5 rounded-full border border-white/20 bg-[#121c30]/90 shadow-2xl focus-within:border-cyan-400 transition-all">
            <Search20Regular className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Search with ${engine.name} or enter website...`}
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none"
              autoFocus
            />
            <button type="submit" className="px-3 py-1 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shrink-0">
              Search
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <span className="text-slate-500 font-medium">Try:</span>
          {trendingTopics.map((topic) => (
            <button key={topic} onClick={() => onNavigate(topic)} className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 hover:text-cyan-300 transition">
              {topic}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-2">
        <h2 className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Speed Dial</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {POPULAR_SHORTCUTS.map((site) => (
            <button
              key={site.id}
              onClick={() => onNavigate(site.url)}
              className={`group flex flex-col p-3 rounded-xl border border-white/10 bg-gradient-to-br ${site.bgColor} hover:border-cyan-400/40 transition-all text-left shadow-lg`}
            >
              <div className="flex items-center gap-2 mb-1">
                {site.url.startsWith('novadesk://') ? (
                  <Globe20Regular className="w-4 h-4 text-cyan-400 shrink-0" />
                ) : (
                  <img src={getFaviconUrl(site.url)} alt="" className="w-4 h-4 rounded object-contain shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <span className="font-bold text-xs text-white truncate group-hover:text-cyan-300">{site.title}</span>
              </div>
              <p className="text-[10px] text-slate-300 line-clamp-2 leading-tight">{site.description}</p>
            </button>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <History20Regular />
              <span>Recent History</span>
            </h2>
            <button onClick={onClearHistory} className="text-[11px] text-slate-400 hover:text-rose-400 transition flex items-center gap-1">
              <Dismiss20Regular className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0f172a]/80 divide-y divide-white/5 overflow-hidden shadow-md">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} onClick={() => onNavigate(item.url)} className="flex items-center justify-between p-2 hover:bg-white/5 transition cursor-pointer text-xs">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <Globe20Regular className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-medium text-slate-200 truncate">{item.title}</span>
                  <span className="text-slate-500 font-mono truncate hidden sm:inline">{item.url}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
