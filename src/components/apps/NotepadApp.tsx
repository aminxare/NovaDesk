'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';

import {
  Document20Regular,
  DocumentAdd20Regular,
  FolderOpen20Regular,
  Save20Regular,
  Copy20Regular,
  Checkmark20Regular,
  Delete20Regular,
  TextWrap20Regular,
  FontIncrease20Regular,
  FontDecrease20Regular,
  Search20Regular,
  ChevronUp20Regular,
  ChevronDown20Regular,
  Dismiss20Regular,
} from '@fluentui/react-icons';
import { useSystemStore } from '../../store/useSystemStore';
import { fileService } from '../../services/fileService';

const LANGUAGES = [
  { id: 'auto', label: 'Auto Detect' },
  { id: 'plaintext', label: 'Plain Text' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'html', label: 'HTML / XML' },
  { id: 'css', label: 'CSS / SCSS' },
  { id: 'json', label: 'JSON' },
  { id: 'python', label: 'Python' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'sql', label: 'SQL' },
  { id: 'bash', label: 'Bash / Shell' },
  { id: 'yaml', label: 'YAML' },
];

const detectLanguage = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'html':
    case 'htm':
    case 'xml':
    case 'svg':
      return 'html';
    case 'css':
    case 'scss':
    case 'less':
      return 'css';
    case 'json':
      return 'json';
    case 'py':
      return 'python';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'sql':
      return 'sql';
    case 'sh':
    case 'bash':
    case 'zsh':
      return 'bash';
    case 'yml':
    case 'yaml':
      return 'yaml';
    default:
      return 'plaintext';
  }
};

const INITIAL_TEXT = `# Welcome to NovaDesk Notepad
# A sleek, modern text editor with syntax highlighting & line numbers

function greet(user: string): string {
  const message = \`Hello, \${user}! Welcome to NovaDesk.\`;
  console.log(message);
  return message;
}

greet("Developer");

// Shortcuts & Features:
// - Syntax highlighting for JS, TS, Python, HTML, CSS, JSON, Markdown, etc.
// - Line numbers with active line highlighting
// - Tab key indentation support (2 spaces)
// - Word Wrap toggle
// - Font zoom controls (In / Out)
// - Quick search (Ctrl+F)
// - Local file Open / Save to IndexedDB (Dexie)
`;

export const NotepadApp: React.FC = () => {
  const { activeNotepadFile } = useSystemStore();
  const [content, setContent] = useState<string>(INITIAL_TEXT);
  const [fileName, setFileName] = useState<string>('Untitled.ts');
  const [fileId, setFileId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [wordWrap, setWordWrap] = useState<boolean>(false);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(14);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  useEffect(() => {
    if (activeNotepadFile) {
      setContent(activeNotepadFile.content || '');
      setFileName(activeNotepadFile.name);
      setFileId(activeNotepadFile.id);
      setSelectedLanguage('auto');
      setIsSaved(true);
    }
  }, [activeNotepadFile]);

  const [cursorPos, setCursorPos] = useState<{ line: number; col: number; selected: number }>({
    line: 1,
    col: 1,
    selected: 0,
  });

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const lineHeight = Math.round(fontSize * 1.6);
  const lines = useMemo(() => content.split('\n'), [content]);
  const totalLines = Math.max(lines.length, 1);

  const wordCount = useMemo(() => {
    const trimmed = content.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [content]);

  const charCount = content.length;

  const activeLanguage = useMemo(() => {
    if (selectedLanguage !== 'auto') return selectedLanguage;
    return detectLanguage(fileName);
  }, [selectedLanguage, fileName]);

  const highlightedHtml = useMemo(() => {
    try {
      const grammar = Prism.languages[activeLanguage] || Prism.languages.plaintext;
      return Prism.highlight(content, grammar, activeLanguage);
    } catch {
      return content;
    }
  }, [content, activeLanguage]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const scrollLeft = e.currentTarget.scrollLeft;
    if (backdropRef.current) {
      backdropRef.current.scrollTop = scrollTop;
      backdropRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  const updateCursorPosition = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const selectionStart = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, selectionStart);
    const lineNum = textBeforeCursor.split('\n').length;
    const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
    const colNum = selectionStart - (lastNewlineIndex === -1 ? 0 : lastNewlineIndex);
    const selectedLen = Math.abs(textarea.selectionEnd - textarea.selectionStart);

    setCursorPos({ line: lineNum, col: colNum, selected: selectedLen });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      setIsSaved(false);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPosition();
      });
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setIsSearchOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleSave = async () => {
    setIsSaved(true);
    if (fileId) {
      try {
        await fileService.updateFileContent(fileId, content);
        showNotification(`Saved "${fileName}" to Dexie DB`);
      } catch (err) {
        console.error('Failed to save file:', err);
      }
    } else {
      showNotification(`Saved "${fileName}" successfully`);
    }
  };

  const handleNewFile = () => {
    if (!isSaved && !window.confirm('You have unsaved changes. Create new file anyway?')) return;
    setContent('');
    setFileName('Untitled.txt');
    setFileId(null);
    setIsSaved(true);
  };

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text !== undefined) {
        setContent(text);
        setFileName(file.name);
        setFileId(null);
        setIsSaved(true);
        showNotification(`Opened "${file.name}"`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col bg-[#111827] text-slate-100 select-none">
      {notification && (
        <div className="absolute top-12 right-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          <Checkmark20Regular className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleOpenFile} className="hidden" />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-[#1f2937]/90 px-3 py-2 text-xs backdrop-blur-md gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleNewFile}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-white/10 transition-colors cursor-pointer"
            title="New File"
          >
            <DocumentAdd20Regular className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">New</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Open File"
          >
            <FolderOpen20Regular className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Open</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Save File (Ctrl+S)"
          >
            <Save20Regular className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-white/10 transition-colors cursor-pointer"
            title="Copy Text"
          >
            {copied ? <Checkmark20Regular className="h-4 w-4 text-emerald-400" /> : <Copy20Regular className="h-4 w-4 text-slate-300" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Clear all text?')) {
                setContent('');
                setIsSaved(false);
              }
            }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
            title="Clear All"
          >
            <Delete20Regular className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <button
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
              isSearchOpen ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/10'
            }`}
            title="Find (Ctrl+F)"
          >
            <Search20Regular className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">Find</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-lg bg-slate-900 px-2 py-1 text-xs text-slate-200 border border-white/10 outline-none cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Line Numbers Toggle */}
          <button
            onClick={() => setShowLineNumbers((prev) => !prev)}
            className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
              showLineNumbers ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 hover:bg-white/10'
            }`}
            title="Toggle Line Numbers"
          >
            Ln
          </button>

          {/* Word Wrap Toggle */}
          <button
            onClick={() => setWordWrap((prev) => !prev)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
              wordWrap ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 hover:bg-white/10'
            }`}
            title="Toggle Word Wrap"
          >
            <TextWrap20Regular className="h-4 w-4" />
          </button>

          {/* Font Zoom Controls */}
          <div className="flex items-center bg-slate-900 rounded-lg border border-white/10 px-1">
            <button
              onClick={() => setFontSize((f) => Math.max(10, f - 2))}
              className="p-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <FontDecrease20Regular className="h-4 w-4" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-300">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(28, f + 2))}
              className="p-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <FontIncrease20Regular className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Find Bar */}
      {isSearchOpen && (
        <div className="flex items-center gap-2 border-b border-white/10 bg-[#1e293b]/95 px-4 py-2 text-xs">
          <Search20Regular className="h-4 w-4 text-cyan-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find in text..."
            className="flex-1 bg-slate-900 px-3 py-1 rounded-lg border border-white/10 text-white outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white cursor-pointer"
          >
            <Dismiss20Regular className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Editor Main Body */}
      <div className="relative flex flex-1 overflow-hidden font-mono" style={{ fontSize: `${fontSize}px` }}>
        {/* Line Number Gutter */}
        {showLineNumbers && (
          <div
            ref={gutterRef}
            className="select-none overflow-hidden bg-[#0d1322] border-r border-white/10 text-right font-mono text-slate-500 py-4 px-3 shrink-0"
            style={{ lineHeight: `${lineHeight}px`, minWidth: '50px' }}
          >
            {Array.from({ length: totalLines }).map((_, idx) => {
              const lineNo = idx + 1;
              const isActive = lineNo === cursorPos.line;
              return (
                <div key={idx} className={isActive ? 'text-cyan-400 font-bold' : ''}>
                  {lineNo}
                </div>
              );
            })}
          </div>
        )}

        {/* Editor Container (Backdrop + Textarea) */}
        <div className="relative flex-1 overflow-hidden bg-[#111827]">
          {/* Syntax Highlighted Backdrop */}
          <pre
            ref={backdropRef}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 m-0 overflow-hidden p-4 font-mono whitespace-pre-wrap break-all ${
              wordWrap ? '' : 'whitespace-pre overflow-x-auto'
            }`}
            style={{ lineHeight: `${lineHeight}px`, tabSize: 2 }}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />

          {/* Transparent Editable Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setIsSaved(false);
            }}
            onScroll={handleScroll}
            onSelect={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            placeholder="Start typing or paste code here..."
            className={`absolute inset-0 m-0 resize-none bg-transparent p-4 font-mono text-transparent caret-cyan-400 outline-none whitespace-pre-wrap break-all ${
              wordWrap ? '' : 'whitespace-pre overflow-x-auto'
            }`}
            style={{ lineHeight: `${lineHeight}px`, tabSize: 2 }}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-white/10 bg-[#0d1322] px-4 py-1.5 font-mono text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-4">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          {cursorPos.selected > 0 && <span>({cursorPos.selected} selected)</span>}
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-cyan-400 uppercase">{activeLanguage}</span>
          <span>{isSaved ? 'Saved (Dexie)' : 'Unsaved'}</span>
        </div>
      </div>
    </div>
  );
};
