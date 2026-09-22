import { useCallback, useState } from 'react';
import { BrowserTab, BookmarkItem, HistoryItem, SearchEngineId } from '../../../types/browser';
import { DEFAULT_BOOKMARKS, SEARCH_ENGINES, formatUrl, extractDomain } from '../../../config/browser.config';

const STORAGE_KEYS = {
  BOOKMARKS: 'novadesk_browser_bookmarks',
  ENGINE: 'novadesk_browser_engine',
  HISTORY: 'novadesk_browser_history',
};

export function useBrowserState() {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      title: 'New Tab',
      url: 'novadesk://newtab',
      history: ['novadesk://newtab'],
      historyIndex: 0,
      isLoading: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  const [searchEngineId, setSearchEngineId] = useState<SearchEngineId>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.ENGINE) as SearchEngineId | null;
        if (saved && SEARCH_ENGINES[saved]) return saved;
      } catch {}
    }
    return 'google';
  });

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_BOOKMARKS;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateActiveTab = useCallback((updater: (tab: BrowserTab) => BrowserTab) => {
    setTabs((prev) => prev.map((t) => (t.id === activeTabId ? updater(t) : t)));
  }, [activeTabId]);

  const handleNavigate = (input: string) => {
    const formatted = formatUrl(input, SEARCH_ENGINES[searchEngineId]);
    const domainTitle = formatted === 'novadesk://newtab' ? 'New Tab' : extractDomain(formatted);

    updateActiveTab((tab) => {
      const newHistory = tab.history.slice(0, tab.historyIndex + 1);
      newHistory.push(formatted);
      return {
        ...tab,
        url: formatted,
        title: domainTitle,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isLoading: formatted !== 'novadesk://newtab',
      };
    });

    if (formatted !== 'novadesk://newtab') {
      const newItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        url: formatted,
        title: domainTitle,
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const nextHist = [newItem, ...prev.filter((h) => h.url !== formatted)].slice(0, 50);
        try { localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(nextHist)); } catch {}
        return nextHist;
      });
    }
  };

  const handleBack = () => {
    if (activeTab.historyIndex > 0) {
      const nextIndex = activeTab.historyIndex - 1;
      const targetUrl = activeTab.history[nextIndex];
      updateActiveTab((tab) => ({
        ...tab,
        url: targetUrl,
        title: targetUrl === 'novadesk://newtab' ? 'New Tab' : extractDomain(targetUrl),
        historyIndex: nextIndex,
      }));
    }
  };

  const handleForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const nextIndex = activeTab.historyIndex + 1;
      const targetUrl = activeTab.history[nextIndex];
      updateActiveTab((tab) => ({
        ...tab,
        url: targetUrl,
        title: targetUrl === 'novadesk://newtab' ? 'New Tab' : extractDomain(targetUrl),
        historyIndex: nextIndex,
      }));
    }
  };

  const handleReload = () => {
    updateActiveTab((tab) => ({ ...tab, isLoading: true }));
    setTimeout(() => updateActiveTab((tab) => ({ ...tab, isLoading: false })), 500);
  };

  const handleHome = () => handleNavigate('novadesk://newtab');

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    setTabs((prev) => [
      ...prev,
      { id: newId, title: 'New Tab', url: 'novadesk://newtab', history: ['novadesk://newtab'], historyIndex: 0, isLoading: false },
    ]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      const newId = `tab-${Date.now()}`;
      setTabs([{ id: newId, title: 'New Tab', url: 'novadesk://newtab', history: ['novadesk://newtab'], historyIndex: 0, isLoading: false }]);
      setActiveTabId(newId);
      return;
    }
    const nextTabs = tabs.filter((t) => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) setActiveTabId(nextTabs[nextTabs.length - 1].id);
  };

  const handleToggleBookmark = () => {
    if (!activeTab.url || activeTab.url === 'novadesk://newtab') return;
    const exists = bookmarks.some((bm) => bm.url === activeTab.url);
    const nextBm = exists
      ? bookmarks.filter((bm) => bm.url !== activeTab.url)
      : [...bookmarks, { id: `bm-${Date.now()}`, title: activeTab.title, url: activeTab.url, category: 'tools' as const }];
    setBookmarks(nextBm);
    try { localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(nextBm)); } catch {}
  };

  const handleChangeSearchEngine = (engineId: SearchEngineId) => {
    setSearchEngineId(engineId);
    try { localStorage.setItem(STORAGE_KEYS.ENGINE, engineId); } catch {}
  };

  const handleClearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(STORAGE_KEYS.HISTORY); } catch {}
  };

  return {
    tabs,
    activeTab,
    activeTabId,
    searchEngineId,
    bookmarks,
    history,
    setActiveTabId,
    updateActiveTab,
    handleNavigate,
    handleBack,
    handleForward,
    handleReload,
    handleHome,
    handleNewTab,
    handleCloseTab,
    handleToggleBookmark,
    handleChangeSearchEngine,
    handleClearHistory,
  };
}


