'use client';

import React, { useEffect, useState } from 'react';
import {
  Globe20Regular,
  Open20Regular,
  Play20Regular,
  Search20Regular,
  Shield20Regular,
} from '@fluentui/react-icons';
import {
  SEARCH_ENGINES,
  extractDomain,
  getEmbeddableUrl,
  isKnownFrameBlocked,
} from '../../../config/browser.config';

interface IframeViewerProps {
  url: string;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  onNavigate: (url: string) => void;
}

// YouTube's player needs same-origin storage. Only grant this to known player
// hosts; normal pages keep the stricter sandbox without allow-same-origin.
const VIDEO_SANDBOX = 'allow-same-origin allow-scripts allow-popups allow-forms allow-presentation';
const WEB_SANDBOX = 'allow-scripts allow-popups allow-forms';
const VIDEO_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';

function getDisplayUrl(url: string): string {
  // Google/Bing result pages cannot be framed. DuckDuckGo's HTML endpoint can.
  if (url.includes('google.com/search') || url.includes('bing.com/search')) {
    const queryMatch = url.match(/[?&]q=([^&]+)/);
    if (queryMatch) {
      return SEARCH_ENGINES.duckduckgo.iframeUrl(decodeURIComponent(queryMatch[1]));
    }
  }
  return url;
}

export const IframeViewer: React.FC<IframeViewerProps> = ({
  url,
  onLoadStart,
  onLoadEnd,
  onNavigate,
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [forceLoad, setForceLoad] = useState(false);

  const embed = getEmbeddableUrl(url);
  const targetUrl = embed?.url ?? getDisplayUrl(url);
  const domain = extractDomain(url);
  const isVideo = Boolean(embed);
  const isYouTube =
    domain === 'youtu.be' || /(^|\.)youtube(-nocookie)?\.com$/.test(domain);
  const isBlocked = !isVideo && !forceLoad && isKnownFrameBlocked(targetUrl);
  const isYouTubePage = isYouTube && isBlocked;
  const showBlocked = iframeError || isBlocked;

  useEffect(() => {
    if (showBlocked) {
      onLoadEnd();
      return;
    }
    onLoadStart();
    const timer = setTimeout(onLoadEnd, 800);
    return () => clearTimeout(timer);
  }, [showBlocked, onLoadStart, onLoadEnd, url]);

  const handleOpenNative = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRetry = () => {
    setIframeError(false);
    setForceLoad(true);
  };

  return (
    <div className="relative w-full h-full bg-[#080d19] flex flex-col">
      {/* Top Banner Notice for External Iframe Sites */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c1629] px-4 py-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          {isVideo ? (
            <Play20Regular className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Globe20Regular className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span className="font-semibold text-white truncate">{domain}</span>
          <span className="text-slate-500 hidden sm:inline">
            •{' '}
            {isVideo
              ? 'Embedded player'
              : isBlocked || iframeError
                ? 'Blocked'
                : 'Web View'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isVideo && !isBlocked && (
            <button
              onClick={() =>
                onNavigate(
                  `https://html.duckduckgo.com/html/?q=${encodeURIComponent(domain)}`
                )
              }
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 transition text-[11px]"
            >
              <Search20Regular className="w-3 h-3 text-amber-400" />
              <span>Search in Iframe</span>
            </button>
          )}

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
        {showBlocked ? (
          <div className="h-full flex flex-col items-center justify-center bg-[#0d1627] text-slate-100 p-6 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10">
              {isYouTubePage ? (
                <Play20Regular className="w-7 h-7 text-cyan-300" />
              ) : (
                <Shield20Regular className="w-7 h-7 text-cyan-300" />
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">
                {isYouTubePage
                  ? 'YouTube video links play here'
                  : isBlocked
                    ? 'This site blocks embedding'
                    : 'This page could not be embedded'}
              </h2>

              <p className="mx-auto max-w-lg text-xs leading-relaxed text-slate-300">
                {isYouTubePage ? (
                  <>
                    YouTube blocks its home, search, and channel pages from being
                    embedded. Paste a video, Shorts, or playlist link in the address
                    bar to play it here.
                  </>
                ) : (
                  <>
                    <span className="font-mono text-cyan-300">{domain}</span>{' '}
                    {isBlocked
                      ? 'sends X-Frame-Options or Content-Security-Policy headers that prevent it from being displayed inside another app. This is a browser security rule, not a NovaDesk error.'
                      : 'refused to load inside the embedded frame. The site may block framing, or the connection may have failed.'}
                  </>
                )}
              </p>

              {isYouTubePage && (
                <p className="mx-auto max-w-lg text-[11px] text-slate-500">
                  Example: youtube.com/watch?v=… or youtu.be/…
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                onClick={handleOpenNative}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg"
              >
                <Open20Regular className="w-4 h-4" />
                <span>Open in real browser</span>
              </button>

              <button
                onClick={handleRetry}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs transition"
              >
                {isBlocked ? 'Try loading anyway' : 'Try again'}
              </button>

              <button
                onClick={() => onNavigate('novadesk://newtab')}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs transition"
              >
                Back to Speed Dial
              </button>
            </div>
          </div>
        ) : (
          <iframe
            src={targetUrl}
            title={url}
            className="w-full h-full border-none"
            sandbox={isVideo ? VIDEO_SANDBOX : WEB_SANDBOX}
            allow={isVideo ? VIDEO_ALLOW : 'fullscreen'}
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="eager"
            onLoad={onLoadEnd}
            onError={() => {
              setIframeError(true);
              onLoadEnd();
            }}
          />
        )}
      </div>
    </div>
  );
};
