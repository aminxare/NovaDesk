'use client';

import React, { useCallback } from 'react';
import { useBrowserState } from './browser/useBrowserState';
import { TabBar } from './browser/TabBar';
import { NavigationBar } from './browser/NavigationBar';
import { BookmarksBar } from './browser/BookmarksBar';
import { NewTabPage } from './browser/NewTabPage';
import { IframeViewer } from './browser/IframeViewer';

export const BrowserApp: React.FC = () => {
  const {
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
  } = useBrowserState();

  const handleLoadStart = useCallback(() => {
    updateActiveTab((t) => ({ ...t, isLoading: true }));
  }, [updateActiveTab]);

  const handleLoadEnd = useCallback(() => {
    updateActiveTab((t) => ({ ...t, isLoading: false }));
  }, [updateActiveTab]);

  return (
    <div className="h-full flex flex-col bg-[#070e1a] text-slate-100 overflow-hidden select-none">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
      />

      <NavigationBar
        key={`${activeTab.id}-${activeTab.url}`}
        activeTab={activeTab}
        searchEngineId={searchEngineId}
        isBookmarked={bookmarks.some((bm) => bm.url === activeTab.url)}
        onNavigate={handleNavigate}
        onBack={handleBack}
        onForward={handleForward}
        onReload={handleReload}
        onHome={handleHome}
        onToggleBookmark={handleToggleBookmark}
        onChangeSearchEngine={handleChangeSearchEngine}
      />

      <BookmarksBar bookmarks={bookmarks} onOpenBookmark={handleNavigate} />

      <div className="flex-1 relative overflow-hidden bg-[#070e1a]">
        {activeTab.url === 'novadesk://newtab' ? (
          <NewTabPage
            searchEngineId={searchEngineId}
            history={history}
            onNavigate={handleNavigate}
            onClearHistory={handleClearHistory}
          />
        ) : (
          <IframeViewer
            key={`${activeTab.id}-${activeTab.url}`}
            url={activeTab.url}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
  );
};



