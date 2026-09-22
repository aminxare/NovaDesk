'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setContent, saveFileContent, newDocument } from '../../store/notepadSlice';
import {
  Save20Regular,
  DocumentAdd20Regular,
  FolderOpen20Regular,
  Checkmark20Regular,
  Info20Regular,
} from '@fluentui/react-icons';
import { fileService } from '../../services/fileService';

export const NotepadApp: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentFile, content, isModified, isLoading } = useAppSelector((state) => state.notepad);
  const [notification, setNotification] = React.useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleSave = async () => {
    try {
      if (!currentFile) {
        const name = prompt('Enter file name to save:', 'untitled.txt');
        if (!name) return;
        const newFile = await fileService.createFile(name, 'documents', content);
        showNotification(`Created and saved "${name}" to Dexie DB`);
      } else {
        await dispatch(saveFileContent()).unwrap();
        showNotification(`Successfully saved "${currentFile.name}" to Dexie DB`);
      }
    } catch (err) {
      console.error('Failed to save file:', err);
      showNotification('Error saving file');
    }
  };

  const handleNew = () => {
    dispatch(newDocument());
    showNotification('New document created');
  };

  const handleOpen = async () => {
    const fileName = prompt('Enter file name to open:');
    if (!fileName) return;
    try {
      const files = await fileService.getAllFiles();
      const found = files.find((f) => f.name.toLowerCase() === fileName.toLowerCase() && f.type === 'file');
      if (found) {
        // We can load via action or dispatch
        dispatch(setContent(found.content || ''));
        showNotification(`Opened "${found.name}"`);
      } else {
        showNotification(`File "${fileName}" not found`);
      }
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] text-slate-100 select-none">
      {notification && (
        <div className="absolute top-12 right-4 z-50 flex items-center gap-2 rounded-xl bg-cyan-600/90 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md animate-in fade-in">
          <Checkmark20Regular className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Menu Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#2d2d2d] px-3 py-1.5 text-xs text-slate-300">
        <div className="flex items-center gap-1">
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 rounded px-2.5 py-1 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="New File"
          >
            <DocumentAdd20Regular className="h-4 w-4 text-cyan-400" />
            <span>New</span>
          </button>
          <button
            onClick={handleOpen}
            className="flex items-center gap-1.5 rounded px-2.5 py-1 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Open File"
          >
            <FolderOpen20Regular className="h-4 w-4 text-amber-400" />
            <span>Open</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded px-2.5 py-1 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Save File"
          >
            <Save20Regular className="h-4 w-4 text-emerald-400" />
            <span>Save</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>{currentFile ? currentFile.name : 'Untitled.txt'}</span>
          {isModified && <span className="text-amber-400 font-bold">*</span>}
          {isLoading && <span className="text-cyan-400 animate-pulse">Loading...</span>}
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-1 flex flex-col p-2 bg-[#181818]">
        <textarea
          value={content}
          onChange={(e) => dispatch(setContent(e.target.value))}
          placeholder="Start typing your notes here. Changes sync directly to Dexie.js IndexedDB..."
          className="flex-1 w-full h-full bg-transparent text-sm text-slate-100 placeholder-slate-600 font-mono resize-none outline-none p-3 leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-white/10 bg-[#2d2d2d] px-3 py-1 text-[11px] font-mono text-slate-400">
        <div>
          Lines: {content.split('\n').length} | Characters: {content.length}
        </div>
        <div className="flex items-center gap-1 text-cyan-400">
          <Info20Regular className="h-3.5 w-3.5" />
          <span>Redux Toolkit + Dexie.js Persistence</span>
        </div>
      </div>
    </div>
  );
};
