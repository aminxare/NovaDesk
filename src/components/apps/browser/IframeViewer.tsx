'use client';

import React, { useState, useEffect } from 'react';
import { Open20Regular, Shield20Regular, Globe20Regular, Search20Regular } from '@fluentui/react-icons';
import { SEARCH_ENGINES, extractDomain } from '../../../config/browser.config';

interface IframeViewerProps {
  url: string;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  onNavigate: (url: string) => void;
}

export const IframeViewer: React.FC<IframeViewerProps> = ({
  url,
  onLoadStart,
  onLoadEnd,
  onNavigate,
}) => {
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    onLoadStart();
    const timer = setTimeout(() => {
      onLoadEnd();
    }, 800);
    return () => clearTimeout(timer);
  }, [url, onLoadStart, onLoadEnd]);

  // Determine effective URL to render in iframe
  const getDisplayUrl = (): string => {
    // If it's a search query URL for Google/Bing, use DuckDuckGo HTML embed which allows iframe rendering
    if (url.includes('google.com/search') || url.includes('bing.com/search')) {
      const queryMatch = url.match(/[?&]q=([^&]+)/);
      if (queryMatch) {
        return SEARCH_ENGINES.duckduckgo.iframeUrl(decodeURIComponent(queryMatch[1]));
      }
    }
    return url;
  };

  const targetUrl = getDisplayUrl();
  const domain = extractDomain(url);

  const handleOpenNative = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative w-full h-full bg-[#080d19] flex flex-col">
      {/* Top Banner Notice for External Iframe Sites */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c1629] px-4 py-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Globe20Regular className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-white truncate">{domain}</span>
          <span className="text-slate-500 hidden sm:inline">• Web View</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(domain)}`)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 transition text-[11px]"
          >
            <Search20Regular className="w-3 h-3 text-amber-400" />
            <span>Search in Iframe</span>
          </button>

          <button
            onClick={handleOpenNative}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition text-[11px] font-medium"
          >
            <Open20Regular className="w-3 h-3" />
            <span>Open Native Tab</span>
          </button>
        </div>
      </div>

      {/* Main Iframe Canvas */}
      <div className="relative flex-1 w-full h-full bg-white">
        {!iframeError ? (
          <iframe
            src={targetUrl}
            title={url}
            className="w-full h-full border-none"
            onLoad={onLoadEnd}
            onError={() => {
              setIframeError(true);
              onLoadEnd();
            }}
            sandbox="disallow-same-origin allow-scripts allow-popups hover-popups allow-forms"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-[#0d1627] text-slate-100 p-6 text-center space-y-4">
            <Shield20Regular className="w-12 h-12 text-cyan-400" />
            <h2 className="text-xl font-bold">Embedding restricted by website security headers</h2>
            <p className="text-xs text-slate-300 max-w-md">
              <span className="text-cyan-300 font-mono">{domain}</span> uses security headers (<span className="font-mono">X-Frame-Options</span> or <span className="font-mono">CSP</span>) that block direct embedding in simulated browser frames.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleOpenNative}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg"
              >
                <Open20Regular className="w-4 h-4" />
                <span>Open in Real Browser Tab</span>
              </button>
              <button
                onClick={() => onNavigate('novadesk://newtab')}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs transition"
              >
                Return to Speed Dial
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

