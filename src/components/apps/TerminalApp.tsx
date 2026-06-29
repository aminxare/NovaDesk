'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';

interface TerminalEntry {
  type: 'output' | 'input';
  text: string;
}

const welcomeLines = [
  'Welcome to NovaDesk Terminal',
  'Type help to see available commands.',
  'This shell is styled like a modern zsh experience.',
  ''
];

const commandHelp = [
  'Available commands:',
  '  help      Show this help message',
  '  clear     Clear the terminal screen',
  '  whoami    Print the current user',
  '  pwd       Print the working directory',
  '  ls        List workspace files',
  '  date      Show the current date and time',
  '  neofetch  Render a mini system banner',
  '  echo      Print arguments',
  '  cat       Show a sample project note',
  '  exit      Leave the shell'
];

export const TerminalApp = () => {
  const [entries, setEntries] = useState<TerminalEntry[]>(() =>
    welcomeLines.map((text) => ({ type: 'output' as const, text }))
  );
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const prompt = useMemo(() => 'guest@novadesk ~ %', []);

  const pushEntry = (entry: TerminalEntry) => {
    setEntries((current) => [...current, entry]);
  };

  const executeCommand = (rawCommand: string) => {
    const command = rawCommand.trim();
    const nextHistory = history.filter((item) => item.length > 0);
    if (command) {
      setHistory([...nextHistory, command]);
      setHistoryIndex(-1);
    }

    if (!command) {
      pushEntry({ type: 'input', text: `${prompt} ` });
      return;
    }

    pushEntry({ type: 'input', text: `${prompt} ${command}` });

    const [first, ...rest] = command.split(/\s+/);
    const args = rest.join(' ');

    switch (first) {
      case 'help':
        commandHelp.forEach((line) => pushEntry({ type: 'output', text: line }));
        break;
      case 'clear':
        setEntries([]);
        break;
      case 'whoami':
        pushEntry({ type: 'output', text: 'guest' });
        break;
      case 'pwd':
        pushEntry({ type: 'output', text: '/home/guest' });
        break;
      case 'ls':
        pushEntry({ type: 'output', text: 'Desktop  Documents  Downloads  Projects' });
        break;
      case 'date':
        pushEntry({ type: 'output', text: format(new Date(), 'PPPP p') });
        break;
      case 'echo':
        pushEntry({ type: 'output', text: args || '' });
        break;
      case 'cat':
        pushEntry({ type: 'output', text: 'NovaDesk is a futuristic desktop simulator crafted with React and Tailwind.' });
        break;
      case 'neofetch':
        pushEntry({ type: 'output', text: '          .-.' });
        pushEntry({ type: 'output', text: '       .-(   )-.' });
        pushEntry({ type: 'output', text: '        `-._Y_.-\'' });
        pushEntry({ type: 'output', text: '           / \\' });
        pushEntry({ type: 'output', text: '  \u001b[96mNovaDesk\u001b[0m  •  React 19 •  Tailwind 4' });
        pushEntry({ type: 'output', text: '  Terminal  •  zsh-inspired shell •  desktop UI' });
        break;
      case 'exit':
        pushEntry({ type: 'output', text: 'Bye!' });
        break;
      default:
        pushEntry({ type: 'output', text: `zsh: command not found: ${first}` });
        break;
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    executeCommand(value);
    setValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex < 0 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setValue(history[nextIndex]);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex < 0 ? -1 : Math.min(history.length - 1, historyIndex + 1);
      setHistoryIndex(nextIndex);
      setValue(nextIndex >= 0 ? history[nextIndex] : '');
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#050816] text-slate-100 font-mono">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#0f172a]/90 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
        <div className="ml-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] text-cyan-200">
          zsh • novadesk
        </div>
      </div>

      <div ref={viewportRef} className="flex-1 overflow-auto px-4 py-4 text-sm leading-6">
        {entries.map((entry, index) => (
          <div key={`${entry.text}-${index}`} className="whitespace-pre-wrap">
            {entry.type === 'input' ? (
              <div className="flex items-start gap-2">
                <span className="text-emerald-400">{entry.text.split(' ')[0]}</span>
                <span className="text-sky-400">{entry.text.split(' ')[1] || ''}</span>
                <span className="text-white">{entry.text.slice(entry.text.indexOf(prompt) + prompt.length + 1)}</span>
              </div>
            ) : (
              <div className="text-slate-200">{entry.text}</div>
            )}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
          <span className="text-emerald-400">{prompt}</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            spellCheck={false}
            autoComplete="off"
            placeholder="Type a command"
          />
        </form>
      </div>
    </div>
  );
};
