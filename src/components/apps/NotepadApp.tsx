'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
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
// - Local file Open / Save
`;

export const NotepadApp: React.FC = () => {
  const [content, setContent] = useState<string>(INITIAL_TEXT);
  const [fileName, setFileName] = useState<string>('Untitled.ts');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [wordWrap, setWordWrap] = useState<boolean>(false);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(14);
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');

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
    if (activeLanguage === 'plaintext' || !Prism.languages[activeLanguage]) {
      return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    try {
      return Prism.highlight(content, Prism.languages[activeLanguage], activeLanguage);
    } catch {
      return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }, [content, activeLanguage]);

  const handleScroll = useCallback(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const updateCursorInfo = useCallback(() => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd, value } = textareaRef.current;
    const textBefore = value.slice(0, selectionStart);
    const lineIndex = textBefore.split('\n').length;
    const lastNewline = textBefore.lastIndexOf('\n');
    const colIndex = selectionStart - lastNewline;
    const selectedChars = Math.abs(selectionEnd - selectionStart);

    setCursorPos({
      line: lineIndex,
      col: colIndex,
      selected: selectedChars,
    });
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
    updateCursorInfo();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd, value } = textarea;
      const tabSpace = '  ';
      const newContent = value.substring(0, selectionStart) + tabSpace + value.substring(selectionEnd);

      setContent(newContent);
      setIsSaved(false);

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + tabSpace.length;
        updateCursorInfo();
      });
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setIsSearchOpen(true);
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      });
    }
  };

  const handleNew = () => {
    setContent('');
    setFileName('Untitled.txt');
    setIsSaved(true);
    textareaRef.current?.focus();
  };

  const handleOpenFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text || '');
      setFileName(file.name);
      setIsSaved(true);
      if (textareaRef.current) {
        textareaRef.current.selectionStart = 0;
        textareaRef.current.selectionEnd = 0;
      }
      updateCursorInfo();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.trim() || 'Untitled.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsSaved(true);
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleClear = () => {
    setContent('');
    setIsSaved(false);
    textareaRef.current?.focus();
  };

  const handleZoomIn = () => {
    setFontSize((prev) => Math.min(prev + 2, 28));
  };

  const handleZoomOut = () => {
    setFontSize((prev) => Math.max(prev - 2, 10));
  };

  const matchIndices = useMemo(() => {
    if (!searchQuery) return [];
    const indices: number[] = [];
    const lowerContent = content.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    let index = lowerContent.indexOf(lowerQuery);

    while (index !== -1) {
      indices.push(index);
      index = lowerContent.indexOf(lowerQuery, index + 1);
    }
    return indices;
  }, [searchQuery, content]);

  const highlightMatch = useCallback(
    (startIndex: number, length: number) => {
      if (!textareaRef.current) return;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(startIndex, startIndex + length);
      updateCursorInfo();
    },
    [updateCursorInfo]
  );

  const handleNextMatch = () => {
    if (matchIndices.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matchIndices.length;
    setCurrentMatchIndex(nextIdx);
    highlightMatch(matchIndices[nextIdx], searchQuery.length);
  };

  const handlePrevMatch = () => {
    if (matchIndices.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matchIndices.length) % matchIndices.length;
    setCurrentMatchIndex(prevIdx);
    highlightMatch(matchIndices[prevIdx], searchQuery.length);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setCurrentMatchIndex(-1);
      return;
    }
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    if (index !== -1) {
      setCurrentMatchIndex(0);
      highlightMatch(index, query.length);
    } else {
      setCurrentMatchIndex(-1);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#0b101b] text-slate-100 select-none">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".txt,.md,.js,.ts,.tsx,.jsx,.json,.html,.css,.scss,.py,.sh,.yaml,.yml,.xml,.csv,.sql"
        onChange={handleFileSelected}
      />

      {/* Top Header & Toolbar */}
      <div className="flex flex-col border-b border-white/10 bg-[#0f172a]/95 backdrop-blur-md">
        {/* Document Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
              <Document20Regular className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="rounded bg-slate-800/80 px-2 py-0.5 text-xs text-slate-100 font-medium border border-cyan-500/50 outline-none w-48"
                />
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to rename"
                  className="group flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span>{fileName}</span>
                  <span className="text-[10px] text-slate-500 group-hover:text-slate-400">✎</span>
                </button>
              )}

              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                  isSaved
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isSaved ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
                />
                <span>{isSaved ? 'Saved' : 'Unsaved'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 px-3 py-1 text-xs font-medium text-cyan-200 hover:text-white shadow-xs transition-all cursor-pointer"
              title="Save document (Ctrl+S)"
            >
              <Save20Regular className="h-3.5 w-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-300 gap-2 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={handleNew}
              className="flex items-center gap-1 rounded px-2 py-1 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="New document"
            >
              <DocumentAdd20Regular className="h-4 w-4 text-cyan-400" />
              <span>New</span>
            </button>

            <button
              onClick={handleOpenFileClick}
              className="flex items-center gap-1 rounded px-2 py-1 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Open file from computer"
            >
              <FolderOpen20Regular className="h-4 w-4 text-amber-400" />
              <span>Open</span>
            </button>

            <div className="h-4 w-px bg-white/10 mx-1" />

            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 border border-white/5">
              <span className="text-slate-400 text-[11px]">Lang:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-xs text-cyan-300 font-medium outline-none cursor-pointer"
                title="Select syntax highlighting language"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-slate-900 text-white">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1 rounded px-2 py-1 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Copy entire document"
            >
              {copied ? (
                <>
                  <Checkmark20Regular className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy20Regular className="h-4 w-4 text-sky-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1 rounded px-2 py-1 hover:bg-red-500/15 hover:text-red-300 text-slate-400 transition-colors cursor-pointer"
              title="Clear all text"
            >
              <Delete20Regular className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen) {
                  requestAnimationFrame(() => searchInputRef.current?.focus());
                }
              }}
              className={`flex items-center gap-1 rounded px-2 py-1 transition-colors cursor-pointer ${
                isSearchOpen ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-white/10 hover:text-white'
              }`}
              title="Find in document (Ctrl+F)"
            >
              <Search20Regular className="h-4 w-4" />
              <span>Find</span>
            </button>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className={`flex items-center gap-1 rounded px-2 py-1 transition-colors cursor-pointer ${
                showLineNumbers ? 'bg-white/10 text-cyan-300' : 'text-slate-400 hover:bg-white/5'
              }`}
              title="Toggle Line Numbers"
            >
              <span className="font-mono text-[11px] font-bold">123</span>
              <span className="hidden sm:inline">Lines</span>
            </button>

            <button
              onClick={() => setWordWrap(!wordWrap)}
              className={`flex items-center gap-1 rounded px-2 py-1 transition-colors cursor-pointer ${
                wordWrap ? 'bg-white/10 text-cyan-300' : 'text-slate-400 hover:bg-white/5'
              }`}
              title="Toggle Word Wrap"
            >
              <TextWrap20Regular className="h-4 w-4" />
              <span className="hidden sm:inline">Wrap</span>
            </button>

            <div className="h-4 w-px bg-white/10 mx-1" />

            <div className="flex items-center gap-0.5 bg-white/5 rounded-md px-1 py-0.5 border border-white/5">
              <button
                onClick={handleZoomOut}
                className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Decrease font size"
              >
                <FontDecrease20Regular className="h-3.5 w-3.5" />
              </button>
              <span className="px-1.5 text-[11px] font-mono text-slate-300 min-w-[28px] text-center">
                {fontSize}px
              </span>
              <button
                onClick={handleZoomIn}
                className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="Increase font size"
              >
                <FontIncrease20Regular className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Find / Search Bar */}
        {isSearchOpen && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e293b]/90 border-t border-white/10">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search20Regular className="h-4 w-4 text-cyan-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (e.shiftKey) handlePrevMatch();
                    else handleNextMatch();
                  } else if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                    textareaRef.current?.focus();
                  }
                }}
                placeholder="Find text..."
                className="w-full bg-slate-900/90 text-xs text-white placeholder-slate-500 rounded px-2.5 py-1 border border-cyan-500/30 focus:border-cyan-400 outline-none"
              />
              <span className="text-[11px] text-slate-400 whitespace-nowrap">
                {matchIndices.length > 0
                  ? `${currentMatchIndex + 1} of ${matchIndices.length}`
                  : searchQuery
                  ? 'No match'
                  : ''}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMatch}
                disabled={matchIndices.length === 0}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-slate-200 transition-colors cursor-pointer"
                title="Previous match (Shift+Enter)"
              >
                <ChevronUp20Regular className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextMatch}
                disabled={matchIndices.length === 0}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-slate-200 transition-colors cursor-pointer"
                title="Next match (Enter)"
              >
                <ChevronDown20Regular className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  textareaRef.current?.focus();
                }}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
                title="Close search"
              >
                <Dismiss20Regular className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor Main Area (Line numbers gutter + Backdrop + Textarea) */}
      <div className="relative flex-1 flex overflow-hidden bg-[#070b14]">
        {/* Line Numbers Gutter */}
        {showLineNumbers && (
          <div
            ref={gutterRef}
            aria-hidden="true"
            className="shrink-0 overflow-hidden bg-[#0b101c] border-r border-white/10 select-none py-3 z-20"
            style={{
              width: `${Math.max(String(totalLines).length * 10 + 26, 44)}px`,
            }}
          >
            {Array.from({ length: totalLines }).map((_, i) => {
              const lineNum = i + 1;
              const isCurrent = cursorPos.line === lineNum;
              return (
                <div
                  key={lineNum}
                  style={{
                    height: `${lineHeight}px`,
                    lineHeight: `${lineHeight}px`,
                    fontSize: `${fontSize}px`,
                  }}
                  className={`text-right pr-3 font-mono font-medium transition-colors ${
                    isCurrent
                      ? 'text-cyan-400 font-bold bg-cyan-500/15 border-r-2 border-cyan-400'
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>
        )}

        {/* Text Area and Syntax Highlighting Backdrop Container */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Syntax Highlighted Backdrop */}
          <pre
            ref={backdropRef}
            aria-hidden="true"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}px`,
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              tabSize: 2,
            }}
            className="absolute inset-0 m-0 py-3 px-4 font-mono text-slate-100 pointer-events-none overflow-auto z-0"
            dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }}
          />

          {/* Interactive Transparent Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            onClick={updateCursorInfo}
            onKeyUp={updateCursorInfo}
            onSelect={updateCursorInfo}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="Start typing your notes here..."
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${lineHeight}px`,
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              tabSize: 2,
              color: 'transparent',
              caretColor: '#38bdf8',
            }}
            className="absolute inset-0 w-full h-full resize-none border-none bg-transparent py-3 px-4 font-mono outline-none selection:bg-cyan-500/30 overflow-auto z-10"
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between border-t border-white/10 bg-[#0d1424] px-4 py-1.5 text-[11px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-cyan-400 font-semibold">Ln {cursorPos.line}</span>,
            <span className="text-cyan-400 font-semibold">Col {cursorPos.col}</span>
            {cursorPos.selected > 0 && (
              <span className="ml-1 text-slate-500">({cursorPos.selected} selected)</span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            <span>{totalLines} lines</span>
            <span>•</span>
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
            <span>•</span>
            <span className="text-cyan-300 capitalize">Lang: {activeLanguage}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="hidden md:inline">Zoom: {Math.round((fontSize / 14) * 100)}%</span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="rounded bg-white/5 px-2 py-0.5 text-slate-300">Plain Text</span>
        </div>
      </div>
    </div>
  );
};
