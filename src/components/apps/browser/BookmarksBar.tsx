/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { BookmarkItem } from '../../../types/browser';
import { getFaviconUrl } from '../../../config/browser.config';
import { Globe20Regular } from '@fluentui/react-icons';

interface BookmarksBarProps {
  bookmarks: BookmarkItem[];
  onOpenBookmark: (url: string) => void;
}

export const BookmarksBar: React.FC<BookmarksBarProps> = ({
  bookmarks,
  onOpenBookmark,
}) => {
  return (
    <div className="flex items-center gap-1.5 bg-[#0b1324] px-3 py-1.5 border-b border-white/10 overflow-x-auto no-scrollbar text-xs">
      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider shrink-0 mr-1">
        Favorites
      </span>

      {bookmarks.map((bm) => {
        const favicon = bm.url.startsWith('novadesk://') ? null : getFaviconUrl(bm.url);

        return (
          <button
            key={bm.id}
            onClick={() => onOpenBookmark(bm.url)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition shrink-0 border border-white/5"
            title={bm.url}
          >
            {favicon ? (
              <img
                src={favicon}
                alt=""
                className="w-3.5 h-3.5 rounded-xs object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe20Regular className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="truncate max-w-[110px]">{bm.title}</span>
          </button>
        );
      })}
    </div>
  );
};
