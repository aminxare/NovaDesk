'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Folder20Regular,
  FolderOpen20Regular,
  Document20Regular,
  Search20Regular,
  ArrowLeft20Regular,
  ArrowUp20Regular,
  Home20Regular,
  Image20Regular,
  ArrowDownload20Regular,
  Grid20Regular,
  List20Regular,
  Checkmark20Regular,
  Delete20Regular,
} from '@fluentui/react-icons';
import { DBFileItem } from '../../db/db';
import { fileService } from '../../services/fileService';
import { ContextMenu, ContextMenuItem } from '../shared/ContextMenu';
import { useSystemStore } from '../../store/useSystemStore';
import { appsConfig } from '../../config/apps.config';
import { useAppDispatch } from '../../store/hooks';
import { setOpenNoticeFile } from '../../store/notepadSlice';

export const ExplorerApp: React.FC = () => {
  const dispatch = useAppDispatch();
  const { openApp } = useSystemStore();
  const [fileItems, setFileItems] = useState<DBFileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item?: DBFileItem } | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const loadFiles = useCallback(async () => {
    try {
      await fileService.initializeDefaults();
      const allFiles = await fileService.getAllFiles();
      setFileItems(allFiles);
    } catch (err) {
      console.error('Failed to load files via fileService:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const rootFolders = useMemo(() => {
    return fileItems.filter((item) => item.parentId === null && item.type === 'folder');
  }, [fileItems]);

  const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

  const currentFolderItems = useMemo(() => {
    return fileItems.filter((item) => item.parentId === currentFolderId);
  }, [fileItems, currentFolderId]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return fileItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [fileItems, searchQuery]);

  const displayedItems = searchQuery.trim() ? searchResults : currentFolderItems;

  const handleOpenFile = (item: DBFileItem) => {
    if (item.type === 'file') {
      dispatch(setOpenNoticeFile(item));
      const notepadConfig = appsConfig.find((a) => a.id === 'notepad');
      if (notepadConfig) {
        openApp({ ...notepadConfig, title: `Notepad - ${item.name}` });
      }
      showNotification(`Opening "${item.name}" in Notepad (Redux state loaded)`);
    } else {
      handleItemClick(item);
    }
  };

  const handleItemClick = (item: DBFileItem) => {
    setSelectedItemId(item.id);
    if (item.type === 'folder') {
      setCurrentPath((prev) => [...prev, item.id]);
      setSearchQuery('');
      setSelectedItemId(null);
    }
  };

  const handleBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath((prev) => prev.slice(0, prev.length - 1));
      setSelectedItemId(null);
    }
  };

  const handleHome = () => {
    setCurrentPath([]);
    setSearchQuery('');
    setSelectedItemId(null);
  };

  const handleNewFolder = async () => {
    const folderName = prompt('Enter new folder name:', 'New Folder');
    if (!folderName) return;

    try {
      await fileService.createFolder(folderName, currentFolderId);
      await loadFiles();
      showNotification(`Created folder "${folderName}"`);
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
  };

  const handleNewFile = async () => {
    const fileName = prompt('Enter new file name:', 'notes.txt');
    if (!fileName) return;

    try {
      await fileService.createFile(fileName, currentFolderId || 'documents', '');
      await loadFiles();
      showNotification(`Created file "${fileName}"`);
    } catch (err) {
      console.error('Failed to create file:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const item = fileItems.find((f) => f.id === id);
    if (!item) return;
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      await fileService.deleteItem(id);
      await loadFiles();
      setSelectedItemId(null);
      showNotification(`Deleted "${item.name}"`);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const getContextMenuItems = (targetItem?: DBFileItem): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [];

    if (targetItem) {
      items.push({
        label: targetItem.type === 'folder' ? 'Open Folder' : 'Open in Notepad',
        icon: targetItem.type === 'folder' ? <FolderOpen20Regular className="h-4 w-4" /> : <Document20Regular className="h-4 w-4" />,
        onClick: () => handleOpenFile(targetItem),
      });
      items.push({
        label: 'Delete',
        icon: <Delete20Regular className="h-4 w-4 text-rose-400" />,
        danger: true,
        onClick: () => handleDeleteItem(targetItem.id),
      });
      items.push({
        label: 'Properties',
        onClick: () => {
          alert(`Name: ${targetItem.name}\nType: ${targetItem.type}\nSize: ${targetItem.size || 'N/A'}\nModified: ${targetItem.date || 'N/A'}`);
        },
      });
    }

    items.push({
      label: 'New Folder',
      icon: <Folder20Regular className="h-4 w-4 text-amber-400" />,
      onClick: handleNewFolder,
    });
    items.push({
      label: 'New File',
      icon: <Document20Regular className="h-4 w-4 text-cyan-400" />,
      onClick: handleNewFile,
    });
    items.push({
      label: 'Refresh',
      onClick: loadFiles,
    });

    return items;
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0b101b] text-slate-300">
        <p className="text-xs animate-pulse">Loading File Explorer & Dexie services...</p>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full flex-col bg-[#0b101b] text-slate-100 select-none"
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
      onClick={() => {
        setContextMenu(null);
        setSelectedItemId(null);
      }}
    >
      {notification && (
        <div className="absolute top-12 right-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <Checkmark20Regular className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems(contextMenu.item)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col border-b border-white/10 bg-[#0f172a]/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-2.5 gap-3 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBack}
              disabled={currentPath.length === 0 && !searchQuery}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 disabled:opacity-30 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft20Regular className="h-4 w-4" />
            </button>
            <button
              onClick={handleHome}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Home (Quick Access)"
            >
              <Home20Regular className="h-4 w-4" />
            </button>
            {currentPath.length > 0 && (
              <button
                onClick={() => {
                  setCurrentPath((p) => p.slice(0, p.length - 1));
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Up one level"
              >
                <ArrowUp20Regular className="h-4 w-4" />
              </button>
            )}

            {/* Breadcrumb Path */}
            <div className="ml-2 flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1 border border-white/10 text-xs text-slate-300 max-w-sm truncate">
              <button onClick={handleHome} className="hover:text-cyan-300 transition-colors">
                Quick Access
              </button>
              {currentPath.map((segId, idx) => {
                const folderObj = fileItems.find((f) => f.id === segId);
                return (
                  <React.Fragment key={segId}>
                    <span className="text-slate-500">/</span>
                    <button
                      onClick={() => setCurrentPath((p) => p.slice(0, idx + 1))}
                      className="hover:text-cyan-300 transition-colors truncate"
                    >
                      {folderObj?.name || segId}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-slate-900/90 rounded-lg px-2.5 py-1 border border-white/10 w-56 focus-within:border-cyan-400 transition-colors">
            <Search20Regular className="h-4 w-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewFolder}
              className="flex items-center gap-1.5 rounded px-2.5 py-1 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <Folder20Regular className="h-4 w-4 text-amber-400" />
              <span>New folder</span>
            </button>
            <button
              onClick={handleNewFile}
              className="flex items-center gap-1.5 rounded px-2.5 py-1 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <Document20Regular className="h-4 w-4 text-cyan-400" />
              <span>New file</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/10 text-slate-400'
              }`}
              title="Grid view"
            >
              <Grid20Regular className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/10 text-slate-400'
              }`}
              title="List view"
            >
              <List20Regular className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Explorer Body (Sidebar + Content Area) */}
      <div className="flex-1 flex overflow-hidden bg-[#070b14]">
        {/* Sidebar */}
        <div className="w-56 bg-[#0b101c] border-r border-white/10 p-3 flex flex-col gap-1 shrink-0 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-2 mb-1">
            Favorites
          </div>
          <button
            onClick={handleHome}
            className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentPath.length === 0 && !searchQuery ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5 text-slate-300'
            }`}
          >
            <Home20Regular className="h-4 w-4 text-cyan-400" />
            <span>Home</span>
          </button>

          <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-2 mb-1">
            Directories
          </div>
          {rootFolders.map((folder) => {
            const isSelected = currentPath.length === 1 && currentPath[0] === folder.id;
            const childCount = fileItems.filter((f) => f.parentId === folder.id).length;
            return (
              <button
                key={folder.id}
                onClick={() => {
                  setCurrentPath([folder.id]);
                  setSearchQuery('');
                  setSelectedItemId(null);
                }}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {folder.id === 'projects' && <Folder20Regular className="h-4 w-4 text-cyan-400 shrink-0" />}
                  {folder.id === 'documents' && <Folder20Regular className="h-4 w-4 text-amber-400 shrink-0" />}
                  {folder.id === 'pictures' && <Image20Regular className="h-4 w-4 text-purple-400 shrink-0" />}
                  {folder.id === 'downloads' && <ArrowDownload20Regular className="h-4 w-4 text-emerald-400 shrink-0" />}
                  {!['projects', 'documents', 'pictures', 'downloads'].includes(folder.id) && (
                    <Folder20Regular className="h-4 w-4 text-amber-400 shrink-0" />
                  )}
                  <span className="truncate">{folder.name}</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">{childCount}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#070b14]">
          {currentPath.length === 0 && !searchQuery ? (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Quick Access Folders
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {rootFolders.map((folder) => {
                    const childCount = fileItems.filter((f) => f.parentId === folder.id).length;
                    return (
                      <div
                        key={folder.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(folder);
                        }}
                        onContextMenu={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setContextMenu({ x: e.clientX, y: e.clientY, item: folder });
                        }}
                        className="group relative flex flex-col items-center p-5 rounded-2xl border border-white/10 bg-[#111827]/80 hover:bg-[#1e293b]/90 hover:border-cyan-500/40 shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400 mb-3 transition-colors">
                          <FolderOpen20Regular className="h-7 w-7 text-amber-400" />
                        </div>
                        <div className="font-medium text-sm text-white truncate max-w-full">{folder.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {childCount} items
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                  Recent Files (Double click to open in Notepad via Redux)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {fileItems
                    .filter((f) => f.type === 'file')
                    .slice(0, 6)
                    .map((file) => (
                      <div
                        key={file.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemId(file.id);
                        }}
                        onDoubleClick={() => handleOpenFile(file)}
                        onContextMenu={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setContextMenu({ x: e.clientX, y: e.clientY, item: file });
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          selectedItemId === file.id
                            ? 'bg-cyan-500/20 border-cyan-400/50'
                            : 'bg-[#111827]/60 border-white/10 hover:bg-[#1e293b]/80'
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                          <Document20Regular className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-white truncate">{file.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {file.size || '1 KB'} • {file.date || 'Today'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">
                  {searchQuery ? `Search Results for "${searchQuery}"` : fileItems.find((f) => f.id === currentFolderId)?.name}
                </h2>
                <span className="text-xs text-slate-400">{displayedItems.length} items</span>
              </div>

              {displayedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <FolderOpen20Regular className="h-12 w-12 mb-2 opacity-40" />
                  <p className="text-sm">This folder is empty</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {displayedItems.map((item) => {
                    const isSelected = selectedItemId === item.id;
                    const childCount = item.type === 'folder' ? fileItems.filter((f) => f.parentId === item.id).length : 0;
                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemId(item.id);
                        }}
                        onDoubleClick={() => handleOpenFile(item)}
                        onContextMenu={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setContextMenu({ x: e.clientX, y: e.clientY, item });
                        }}
                        className={`group flex flex-col items-center p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400/50 shadow-lg'
                            : 'bg-[#111827]/70 border-white/10 hover:bg-[#1e293b]/90 hover:border-white/20'
                        }`}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl mb-3 text-cyan-400 bg-cyan-500/10 group-hover:scale-105 transition-transform">
                          {item.type === 'folder' ? (
                            <FolderOpen20Regular className="h-6 w-6 text-amber-400" />
                          ) : (
                            <Document20Regular className="h-6 w-6 text-sky-400" />
                          )}
                        </div>
                        <div className="text-xs font-medium text-white text-center truncate max-w-full">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.type === 'folder' ? `${childCount} items` : item.size || '1 KB'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col bg-[#111827]/70 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="grid grid-cols-12 px-4 py-2.5 border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-6">Name</div>
                    <div className="col-span-3">Date modified</div>
                    <div className="col-span-3 text-right">Size</div>
                  </div>
                  {displayedItems.map((item) => {
                    const isSelected = selectedItemId === item.id;
                    const childCount = item.type === 'folder' ? fileItems.filter((f) => f.parentId === item.id).length : 0;
                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemId(item.id);
                        }}
                        onDoubleClick={() => handleOpenFile(item)}
                        onContextMenu={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setContextMenu({ x: e.clientX, y: e.clientY, item });
                        }}
                        className={`grid grid-cols-12 px-4 py-2.5 items-center text-xs border-b border-white/5 transition-colors cursor-pointer ${
                          isSelected ? 'bg-cyan-500/20 text-white' : 'hover:bg-white/5 text-slate-200'
                        }`}
                      >
                        <div className="col-span-6 flex items-center gap-2.5 truncate">
                          {item.type === 'folder' ? (
                            <FolderOpen20Regular className="h-4 w-4 text-amber-400 shrink-0" />
                          ) : (
                            <Document20Regular className="h-4 w-4 text-sky-400 shrink-0" />
                          )}
                          <span className="truncate font-medium">{item.name}</span>
                        </div>
                        <div className="col-span-3 text-slate-400 text-[11px]">{item.date || '2026-09-22'}</div>
                        <div className="col-span-3 text-right text-slate-400 text-[11px]">
                          {item.type === 'folder' ? `${childCount} items` : item.size || '1 KB'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between border-t border-white/10 bg-[#0d1424] px-4 py-1.5 text-[11px] font-mono text-slate-400 select-none">
        <div>
          {displayedItems.length} items • Right-click for context menu
        </div>
        <div>Redux Toolkit + Dexie.js Architecture</div>
      </div>
    </div>
  );
};
