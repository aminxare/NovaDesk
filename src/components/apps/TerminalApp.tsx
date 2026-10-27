'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { DBFileItem } from '../../db/db';
import { fileService } from '../../services/fileService';
import { useSystemStore } from '../../store/useSystemStore';

type EntryTone = 'default' | 'error' | 'success' | 'muted' | 'accent';

interface TerminalPrompt {
  user: string;
  host: string;
  path: string;
}

interface TerminalEntry {
  id: string;
  type: 'input' | 'output';
  text: string;
  prompt?: TerminalPrompt;
  tone?: EntryTone;
}

interface CwdEntry {
  id: string;
  name: string;
}

interface CommandHelp {
  name: string;
  usage: string;
  description: string;
  aliases?: string[];
}

const terminalThemes = {
  cyan: {
    label: 'cyan',
    path: 'text-sky-400',
    accent: 'text-cyan-300',
    badge: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200',
  },
  emerald: {
    label: 'emerald',
    path: 'text-emerald-400',
    accent: 'text-emerald-300',
    badge: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  },
  violet: {
    label: 'violet',
    path: 'text-violet-400',
    accent: 'text-violet-300',
    badge: 'border-violet-400/30 bg-violet-500/10 text-violet-200',
  },
  amber: {
    label: 'amber',
    path: 'text-amber-400',
    accent: 'text-amber-300',
    badge: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
  },
  rose: {
    label: 'rose',
    path: 'text-rose-400',
    accent: 'text-rose-300',
    badge: 'border-rose-400/30 bg-rose-500/10 text-rose-200',
  },
} as const;

type ThemeKey = keyof typeof terminalThemes;
type TerminalTheme = (typeof terminalThemes)[ThemeKey];

const toneClasses: Record<Exclude<EntryTone, 'accent'>, string> = {
  default: 'text-slate-200',
  error: 'text-rose-300',
  success: 'text-emerald-300',
  muted: 'text-slate-500',
};

const commandAliases: Record<string, string> = {
  cls: 'clear',
  quit: 'exit',
  logout: 'exit',
  '?': 'help',
};

const commandHelp: CommandHelp[] = [
  { name: 'help', usage: 'help [command]', description: 'Show this list or details for one command.', aliases: ['?'] },
  { name: 'clear', usage: 'clear', description: 'Clear the terminal screen.', aliases: ['cls'] },
  { name: 'exit', usage: 'exit', description: 'Close the terminal window.', aliases: ['quit', 'logout'] },
  { name: 'whoami', usage: 'whoami', description: 'Print the current user.' },
  { name: 'hostname', usage: 'hostname', description: 'Print the machine name.' },
  { name: 'pwd', usage: 'pwd', description: 'Print the working directory.' },
  { name: 'ls', usage: 'ls [-l] [directory]', description: 'List workspace files from IndexedDB.' },
  { name: 'cd', usage: 'cd [directory]', description: 'Change the current directory.' },
  { name: 'cat', usage: 'cat <file>', description: 'Print the contents of a file.' },
  { name: 'tree', usage: 'tree [directory]', description: 'Show a directory tree.' },
  { name: 'find', usage: 'find <query>', description: 'Search the workspace by name.' },
  { name: 'mkdir', usage: 'mkdir <name>', description: 'Create a folder in the current directory.' },
  { name: 'touch', usage: 'touch <name>', description: 'Create an empty file in the current directory.' },
  { name: 'rm', usage: 'rm [-r] <path>', description: 'Remove a file or folder (use -r for folders).' },
  { name: 'echo', usage: 'echo <text>', description: 'Print text. Supports $USER, $HOSTNAME, $SHELL, $PWD.' },
  { name: 'date', usage: 'date', description: 'Show the current date and time.' },
  { name: 'uptime', usage: 'uptime', description: 'Show how long this terminal has been open.' },
  { name: 'uname', usage: 'uname [-a]', description: 'Print system information.' },
  { name: 'history', usage: 'history [-c]', description: 'Show command history, or clear it with -c.' },
  { name: 'theme', usage: 'theme [name]', description: 'Show or change the terminal accent theme.' },
  { name: 'neofetch', usage: 'neofetch', description: 'Render a system banner.' },
  { name: 'about', usage: 'about', description: 'Learn about NovaDesk.' },
  { name: 'version', usage: 'version', description: 'Print the NovaDesk version.' },
];

const welcomeLines = [
  'Welcome to NovaDesk Terminal',
  'Type "help" to see available commands, or "neofetch" for system info.',
  'Your files are shared with File Explorer.',
  '',
];

const neofetchArt = [
  '      .-/+oossssoo+/-.',
  '   .:+ssssssssssssss+:',
  '  -+ssssssssssssssss+-',
  ' /ssssssssssssssssssss/',
  ' +ssssssssssssssssssss+',
  ' /ssssssssssssssssssss/',
  '  -+ssssssssssssssss+-',
  '   `:+ssssssssssssss+:',
  '      .-/+oossssoo+/-.',
];

const getChildren = (files: DBFileItem[], parentId: string | null): DBFileItem[] =>
  files.filter((item) => (item.parentId ?? null) === parentId);

const sortItems = (items: DBFileItem[]): DBFileItem[] =>
  [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

const cwdLabel = (stack: CwdEntry[]): string =>
  stack.length ? `~/${stack.map((entry) => entry.name).join('/')}` : '~';

const absolutePath = (stack: CwdEntry[]): string =>
  stack.length ? `/home/guest/${stack.map((entry) => entry.name).join('/')}` : '/home/guest';

const formatUptime = (elapsedMs: number): string => {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours ? `${hours}h` : '', hours || minutes ? `${minutes}m` : '', `${seconds}s`]
    .filter(Boolean)
    .join(' ');
};

const getBrowserLabel = (): string => {
  if (typeof navigator === 'undefined') return 'Unknown';
  const userAgent = navigator.userAgent;
  const checks: Array<[RegExp, string]> = [
    [/Edg\/([\d.]+)/, 'Edge'],
    [/OPR\/([\d.]+)/, 'Opera'],
    [/Firefox\/([\d.]+)/, 'Firefox'],
    [/Chrome\/([\d.]+)/, 'Chrome'],
    [/Version\/([\d.]+).*Safari/, 'Safari'],
  ];
  for (const [pattern, name] of checks) {
    const match = userAgent.match(pattern);
    if (match) return `${name} ${match[1]}`;
  }
  return 'Browser';
};

const getResolution = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  return `${window.innerWidth}x${window.innerHeight}`;
};

const PromptLabel = ({ prompt, theme }: { prompt: TerminalPrompt; theme: TerminalTheme }) => (
  <span className="shrink-0">
    <span className="text-emerald-400">
      {prompt.user}@{prompt.host}
    </span>{' '}
    <span className={theme.path}>{prompt.path}</span> <span className="text-slate-500">%</span>
  </span>
);

type PathWalk =
  | { stack: CwdEntry[]; item?: DBFileItem }
  | { error: string };

export const TerminalApp = () => {
  const closeApp = useSystemStore((state) => state.closeApp);
  const [entries, setEntries] = useState<TerminalEntry[]>(() =>
    welcomeLines.map((text, index) => ({ id: `welcome-${index}`, type: 'output' as const, text, tone: index === 0 ? 'accent' : 'default' }))
  );
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwdStack, setCwdStack] = useState<CwdEntry[]>([]);
  const [themeKey, setThemeKey] = useState<ThemeKey>('cyan');
  const [isExiting, setIsExiting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const entryIdRef = useRef(welcomeLines.length);
  const mountedAtRef = useRef(0);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = terminalThemes[themeKey];
  const currentCwdLabel = useMemo(() => cwdLabel(cwdStack), [cwdStack]);
  const pwdPath = useMemo(() => absolutePath(cwdStack), [cwdStack]);
  const prompt = useMemo<TerminalPrompt>(
    () => ({ user: 'guest', host: 'novadesk', path: currentCwdLabel }),
    [currentCwdLabel]
  );

  useEffect(() => {
    void fileService.initializeDefaults();
  }, []);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries]);

  useEffect(() => {
    mountedAtRef.current = Date.now();
    inputRef.current?.focus();
  }, []);

  useEffect(
    () => () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    },
    []
  );

  const pushEntry = (entry: Omit<TerminalEntry, 'id'>) => {
    const nextEntry: TerminalEntry = { ...entry, id: `entry-${entryIdRef.current++}` };
    setEntries((current) => [...current, nextEntry]);
  };

  const pushOutput = (text: string, tone: EntryTone = 'default') => {
    pushEntry({ type: 'output', text, tone });
  };

  const walkPath = (files: DBFileItem[], raw: string): PathWalk => {
    const trimmed = raw.trim();
    let stack =
      trimmed.startsWith('~') || trimmed.startsWith('/') ? ([] as CwdEntry[]) : [...cwdStack];
    let segments = trimmed.split('/').filter(Boolean);
    if (trimmed.startsWith('~')) segments = segments.slice(1);
    if (
      trimmed.startsWith('/') &&
      segments[0]?.toLowerCase() === 'home' &&
      segments[1]?.toLowerCase() === 'guest'
    ) {
      segments = segments.slice(2);
    }

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      if (segment === '.') continue;
      if (segment === '..') {
        stack = stack.slice(0, -1);
        continue;
      }

      const parentId = stack.length ? stack[stack.length - 1].id : null;
      const child = getChildren(files, parentId).find(
        (item) => item.name.toLowerCase() === segment.toLowerCase()
      );
      if (!child) return { error: `no such file or directory: ${trimmed}` };
      if (index === segments.length - 1) return { stack, item: child };
      if (child.type !== 'folder') return { error: `not a directory: ${segment}` };
      stack = [...stack, { id: child.id, name: child.name }];
    }

    return { stack };
  };

  const resolveDirectory = (files: DBFileItem[], raw: string): { stack: CwdEntry[] } | { error: string } => {
    const result = walkPath(files, raw);
    if ('error' in result) return { error: result.error };
    if (result.item) {
      if (result.item.type !== 'folder') return { error: `not a directory: ${raw.trim()}` };
      return { stack: [...result.stack, { id: result.item.id, name: result.item.name }] };
    }
    return { stack: result.stack };
  };

  const resolveItem = (files: DBFileItem[], raw: string): { item: DBFileItem } | { error: string } => {
    const result = walkPath(files, raw);
    if ('error' in result) return { error: result.error };
    if (!result.item) return { error: `not a file or directory: ${raw.trim()}` };
    return { item: result.item };
  };

  const complete = async () => {
    if (!value || isExiting) return;

    const endsWithSpace = /\s$/.test(value);
    const tokens = value.trim().split(/\s+/);

    if (tokens.length === 1 && !endsWithSpace) {
      const prefix = tokens[0].toLowerCase();
      const matches = commandHelp
        .map((command) => command.name)
        .filter((name) => name.startsWith(prefix));
      if (matches.length === 1) setValue(`${matches[0]} `);
      else if (matches.length > 1) pushOutput(matches.join('  '), 'muted');
      return;
    }

    const commandName = commandAliases[tokens[0].toLowerCase()] ?? tokens[0].toLowerCase();
    if (!['cd', 'ls', 'cat', 'tree', 'rm'].includes(commandName)) return;

    try {
      const files = await fileService.getAllFiles();
      const currentId = cwdStack.length ? cwdStack[cwdStack.length - 1].id : null;
      let candidates = getChildren(files, currentId);
      if (commandName === 'cd' || commandName === 'tree') {
        candidates = candidates.filter((item) => item.type === 'folder');
      }
      if (commandName === 'cat') {
        candidates = candidates.filter((item) => item.type === 'file');
      }

      const prefix = endsWithSpace ? '' : tokens[tokens.length - 1];
      const matches = sortItems(
        candidates.filter((item) => item.name.toLowerCase().startsWith(prefix.toLowerCase()))
      );
      if (matches.length === 0) return;

      if (matches.length === 1) {
        const match = matches[0];
        const base = endsWithSpace ? value : value.slice(0, value.length - prefix.length);
        setValue(`${base}${match.name}${match.type === 'folder' ? '/' : ''}`);
        return;
      }

      pushOutput(matches.map((item) => `${item.name}${item.type === 'folder' ? '/' : ''}`).join('  '), 'muted');
    } catch (error) {
      console.error('Terminal completion failed:', error);
    }
  };

  const executeCommand = async (rawCommand: string) => {
    const commandLine = rawCommand.trim();
    if (commandLine) {
      setHistory((current) => [...current, commandLine]);
      setHistoryIndex(-1);
    }

    if (!commandLine) {
      pushEntry({ type: 'input', prompt, text: '' });
      return;
    }

    pushEntry({ type: 'input', prompt, text: commandLine });

    const tokens = commandLine.split(/\s+/);
    const first = tokens[0];
    const args = commandLine.slice(first.length).trim();
    const commandName = commandAliases[first.toLowerCase()] ?? first.toLowerCase();

    try {
      switch (commandName) {
        case 'help': {
          const query = args.toLowerCase();
          if (query) {
            const command = commandHelp.find(
              (item) => item.name === query || item.aliases?.includes(query)
            );
            if (!command) {
              pushOutput(`help: no help topic for '${args}'`, 'error');
              break;
            }
            pushOutput(command.usage, 'accent');
            pushOutput(command.description);
            if (command.aliases?.length) {
              pushOutput(`Aliases: ${command.aliases.join(', ')}`, 'muted');
            }
            break;
          }

          pushOutput('Available commands:', 'accent');
          const usageWidth = Math.max(...commandHelp.map((command) => command.usage.length));
          commandHelp.forEach((command) => {
            pushOutput(`  ${command.usage.padEnd(usageWidth)}  ${command.description}`);
          });
          pushOutput('');
          pushOutput('Tab completes · ↑/↓ history · Ctrl+L clear · Ctrl+C cancel', 'muted');
          break;
        }

        case 'clear':
          setEntries([]);
          inputRef.current?.focus();
          break;

        case 'exit':
          setIsExiting(true);
          pushOutput('Session closed. Goodbye!', 'success');
          exitTimerRef.current = setTimeout(() => closeApp('terminal'), 450);
          break;

        case 'whoami':
          pushOutput('guest');
          break;

        case 'hostname':
          pushOutput('novadesk');
          break;

        case 'pwd':
          pushOutput(pwdPath);
          break;

        case 'ls': {
          const files = await fileService.getAllFiles();
          const flagTokens = args.split(/\s+/).filter(Boolean);
          const longFormat = flagTokens.some((token) => /^-[al]+$/.test(token) && token.includes('l'));
          const target = flagTokens.filter((token) => !token.startsWith('-')).join(' ');
          const resolution = resolveDirectory(files, target);
          if ('error' in resolution) {
            pushOutput(`ls: ${resolution.error}`, 'error');
            break;
          }

          const parentId = resolution.stack.length
            ? resolution.stack[resolution.stack.length - 1].id
            : null;
          const items = sortItems(getChildren(files, parentId));
          if (!items.length) {
            pushOutput('(empty directory)', 'muted');
            break;
          }

          if (longFormat) {
            items.forEach((item) => {
              const kind = item.type === 'folder' ? 'd' : '-';
              const size = (item.size ?? '--').padStart(8);
              const date = item.date ?? '--';
              const suffix = item.type === 'folder' ? '/' : '';
              pushOutput(`${kind}  ${size}  ${date}  ${item.name}${suffix}`, item.type === 'folder' ? 'accent' : 'default');
            });
          } else {
            pushOutput(
              items.map((item) => `${item.name}${item.type === 'folder' ? '/' : ''}`).join('    ')
            );
          }
          break;
        }

        case 'cd': {
          const files = await fileService.getAllFiles();
          const resolution = resolveDirectory(files, args || '~');
          if ('error' in resolution) {
            pushOutput(`cd: ${resolution.error}`, 'error');
            break;
          }
          setCwdStack(resolution.stack);
          break;
        }

        case 'cat': {
          if (!args) {
            pushOutput('cat: missing file operand', 'error');
            break;
          }
          const files = await fileService.getAllFiles();
          const resolution = resolveItem(files, args);
          if ('error' in resolution) {
            pushOutput(`cat: ${resolution.error}`, 'error');
            break;
          }
          if (resolution.item.type === 'folder') {
            pushOutput(`cat: ${resolution.item.name}: Is a directory`, 'error');
            break;
          }
          if (!resolution.item.content) {
            pushOutput('(empty file)', 'muted');
            break;
          }
          resolution.item.content.split('\n').forEach((line) => pushOutput(line));
          break;
        }

        case 'tree': {
          const files = await fileService.getAllFiles();
          const resolution = resolveDirectory(files, args || '.');
          if ('error' in resolution) {
            pushOutput(`tree: ${resolution.error}`, 'error');
            break;
          }
          const parentId = resolution.stack.length
            ? resolution.stack[resolution.stack.length - 1].id
            : null;
          pushOutput(args || '.', 'accent');

          const walkTree = (id: string | null, prefix: string) => {
            const items = sortItems(getChildren(files, id));
            items.forEach((item, index) => {
              const isLast = index === items.length - 1;
              const connector = isLast ? '└── ' : '├── ';
              pushOutput(
                `${prefix}${connector}${item.name}${item.type === 'folder' ? '/' : ''}`,
                item.type === 'folder' ? 'accent' : 'default'
              );
              if (item.type === 'folder' && prefix.length < 24) {
                walkTree(item.id, `${prefix}${isLast ? '    ' : '│   '}`);
              }
            });
          };

          walkTree(parentId, '');
          break;
        }

        case 'find': {
          const query = args.trim().toLowerCase();
          if (!query) {
            pushOutput('find: missing search query', 'error');
            break;
          }
          const files = await fileService.getAllFiles();
          const byId = new Map(files.map((item) => [item.id, item]));
          const pathOf = (item: DBFileItem): string => {
            const parts = [item.name];
            let current = item;
            while (current.parentId) {
              const parent = byId.get(current.parentId);
              if (!parent) break;
              parts.unshift(parent.name);
              current = parent;
            }
            return parts.join('/');
          };

          const matches = sortItems(
            files.filter((item) => item.name.toLowerCase().includes(query))
          );
          if (!matches.length) {
            pushOutput(`No matches for "${args.trim()}".`, 'muted');
            break;
          }
          matches.forEach((item) => {
            pushOutput(
              `/home/guest/${pathOf(item)}${item.type === 'folder' ? '/' : ''}`,
              item.type === 'folder' ? 'accent' : 'default'
            );
          });
          pushOutput(`${matches.length} match${matches.length === 1 ? '' : 'es'}.`, 'muted');
          break;
        }

        case 'mkdir': {
          const name = args.trim();
          if (!name) {
            pushOutput('mkdir: missing directory name', 'error');
            break;
          }
          const files = await fileService.getAllFiles();
          const parentId = cwdStack.length ? cwdStack[cwdStack.length - 1].id : null;
          const exists = getChildren(files, parentId).some(
            (item) => item.name.toLowerCase() === name.toLowerCase()
          );
          if (exists) {
            pushOutput(`mkdir: cannot create directory '${name}': File exists`, 'error');
            break;
          }
          await fileService.createFolder(name, parentId);
          pushOutput(`Created directory '${name}'.`, 'success');
          break;
        }

        case 'touch': {
          const name = args.trim();
          if (!name) {
            pushOutput('touch: missing file name', 'error');
            break;
          }
          const files = await fileService.getAllFiles();
          const parentId = cwdStack.length ? cwdStack[cwdStack.length - 1].id : null;
          const exists = getChildren(files, parentId).some(
            (item) => item.name.toLowerCase() === name.toLowerCase()
          );
          if (exists) {
            pushOutput(`touch: '${name}' already exists`, 'error');
            break;
          }
          await fileService.createFile(name, parentId, '');
          pushOutput(`Created file '${name}'.`, 'success');
          break;
        }

        case 'rm': {
          const rmTokens = args.split(/\s+/).filter(Boolean);
          const recursive = rmTokens.some((token) => /^-[a-z]*r/i.test(token));
          const target = rmTokens.filter((token) => !token.startsWith('-')).join(' ');
          if (!target) {
            pushOutput('rm: missing operand', 'error');
            break;
          }
          const files = await fileService.getAllFiles();
          const resolution = resolveItem(files, target);
          if ('error' in resolution) {
            pushOutput(`rm: ${resolution.error}`, 'error');
            break;
          }
          const item = resolution.item;
          if (cwdStack.some((entry) => entry.id === item.id)) {
            pushOutput('rm: cannot remove the current directory or its parent', 'error');
            break;
          }
          if (item.type === 'folder' && !recursive) {
            pushOutput(`rm: '${item.name}' is a directory (use -r)`, 'error');
            break;
          }
          await fileService.deleteItem(item.id);
          pushOutput(`Removed '${item.name}'.`, 'success');
          break;
        }

        case 'echo': {
          const expanded = args
            .replace(/\$USER\b/g, 'guest')
            .replace(/\$HOSTNAME\b/g, 'novadesk')
            .replace(/\$SHELL\b/g, 'zsh')
            .replace(/\$PWD\b/g, pwdPath);
          pushOutput(expanded);
          break;
        }

        case 'date':
          pushOutput(format(new Date(), 'PPPP p'));
          break;

        case 'uptime':
          pushOutput(`up ${formatUptime(Date.now() - mountedAtRef.current)}`);
          break;

        case 'uname':
          pushOutput(
            args.split(/\s+/).includes('-a')
              ? 'NovaDesk novadesk 1.0.0 zsh React-19 browser'
              : 'NovaDesk'
          );
          break;

        case 'history': {
          if (args === '-c') {
            setHistory([]);
            setHistoryIndex(-1);
            pushOutput('History cleared.', 'success');
            break;
          }
          if (!history.length) {
            pushOutput('No commands in history.', 'muted');
            break;
          }
          history.forEach((item, index) => {
            pushOutput(`${String(index + 1).padStart(4)}  ${item}`);
          });
          break;
        }

        case 'theme': {
          const requested = args.trim().toLowerCase();
          if (!requested) {
            pushOutput(`Current theme: ${theme.label}`, 'accent');
            pushOutput(`Available themes: ${Object.keys(terminalThemes).join(', ')}`, 'muted');
            break;
          }
          if (!(requested in terminalThemes)) {
            pushOutput(
              `theme: '${args}' is not available. Try: ${Object.keys(terminalThemes).join(', ')}`,
              'error'
            );
            break;
          }
          setThemeKey(requested as ThemeKey);
          pushOutput(`Theme set to ${requested}.`, 'success');
          break;
        }

        case 'neofetch': {
          const files = await fileService.getAllFiles();
          const info = [
            'guest@novadesk',
            '--------------',
            'OS: NovaDesk 1.0',
            'Shell: zsh (nsh 1.0)',
            `Browser: ${getBrowserLabel()}`,
            `Resolution: ${getResolution()}`,
            `Theme: ${theme.label}`,
            `Workspace: ${files.length} items`,
            `Uptime: ${formatUptime(Date.now() - mountedAtRef.current)}`,
          ];
          const lines = Math.max(neofetchArt.length, info.length);
          for (let index = 0; index < lines; index += 1) {
            pushOutput(`${(neofetchArt[index] ?? '').padEnd(28)}${info[index] ?? ''}`);
          }
          break;
        }

        case 'about':
          pushOutput('NovaDesk 1.0', 'accent');
          pushOutput('A Windows 11-inspired desktop that runs entirely in your browser.');
          pushOutput('Built with Next.js, React 19, TypeScript, Tailwind CSS, Zustand, Redux Toolkit, and Dexie.');
          pushOutput('No backend — your files live in IndexedDB.', 'muted');
          break;

        case 'version':
          pushOutput('NovaDesk 1.0.0 (nsh 1.0)');
          break;

        default:
          pushOutput(`zsh: command not found: ${first}`, 'error');
          pushOutput('Type "help" to see available commands.', 'muted');
          break;
      }
    } catch (error) {
      console.error('Terminal command failed:', error);
      pushOutput(error instanceof Error ? error.message : 'Command failed.', 'error');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isExiting) return;
    const command = value;
    setValue('');
    inputRef.current?.focus();
    void executeCommand(command);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isExiting) return;

    if (event.key === 'Tab') {
      event.preventDefault();
      void complete();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      setEntries([]);
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      if (value) pushEntry({ type: 'input', prompt, text: value });
      pushOutput('^C', 'muted');
      setValue('');
      setHistoryIndex(-1);
      return;
    }

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
        <div className={`ml-2 rounded-full border px-2.5 py-0.5 text-[11px] ${theme.badge}`}>
          zsh • novadesk
        </div>
        <div className="ml-auto text-[11px] text-slate-500">
          {currentCwdLabel} · {theme.label}
        </div>
      </div>

      <div
        ref={viewportRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 overflow-auto px-4 py-4 text-sm leading-6"
      >
        {entries.map((entry) => (
          <div key={entry.id} className="whitespace-pre-wrap break-words">
            {entry.type === 'input' ? (
              <div className="flex items-start gap-2">
                {entry.prompt && <PromptLabel prompt={entry.prompt} theme={theme} />}
                <span className="text-slate-100">{entry.text}</span>
              </div>
            ) : (
              <div
                className={
                  entry.tone && entry.tone !== 'accent'
                    ? toneClasses[entry.tone]
                    : entry.tone === 'accent'
                      ? theme.accent
                      : toneClasses.default
                }
              >
                {entry.text || '\u00A0'}
              </div>
            )}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
          <PromptLabel prompt={prompt} theme={theme} />
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExiting}
            className="flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            spellCheck={false}
            autoComplete="off"
            placeholder={isExiting ? 'Closing session…' : 'Type a command (try: help)'}
          />
        </form>
      </div>
    </div>
  );
};
