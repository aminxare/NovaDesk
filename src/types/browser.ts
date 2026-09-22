export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
  isIframeBlocked?: boolean;
  favicon?: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category: 'search' | 'social' | 'developer' | 'reference' | 'tools';
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

export type SearchEngineId = 'google' | 'duckduckgo' | 'bing' | 'wikipedia';

export interface SearchEngine {
  id: SearchEngineId;
  name: string;
  searchUrl: (query: string) => string;
  iframeUrl: (query: string) => string;
  icon: string;
}
