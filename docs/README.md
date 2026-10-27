# NovaDesk documentation

NovaDesk is a Windows 11-style desktop environment simulated in the browser. It has a draggable
window manager, taskbar, Start menu, and a set of built-in apps (File Explorer, Notepad, Browser,
Terminal, Settings). Everything runs client-side; there is no server or database service.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript (strict) |
| System state | Zustand 5 |
| App state | Redux Toolkit 2 + React Redux |
| Persistence | Dexie 4 (IndexedDB), plus `localStorage` for the Browser |
| Window manager | `react-rnd` |
| Motion | `framer-motion` |
| Icons | `@fluentui/react-icons` |
| Dates | `date-fns` |
| Syntax highlighting | Prism.js |

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The app boots into an empty desktop; double-click an icon, use the
taskbar, or open the Start menu. File Explorer seeds a demo file system on first use.

If you use pnpm instead, use `pnpm install` and `pnpm dev`. The repo contains both
`package-lock.json` and `pnpm-lock.yaml`; pick one package manager and stay with it.

## Repository layout

```
app/                       Next.js shell: layout, page, providers, global CSS
src/components/system/     Desktop, Taskbar, StartMenu
src/components/apps/       App implementations
  browser/                 Browser subcomponents and useBrowserState
  settings/                Settings sections
src/components/shared/     Window, ContextMenu
src/config/                appsConfig, browser config, personalization presets
src/store/                 Zustand store, Redux store/hooks/notepad slice
src/services/              fileService, settingsService
src/db/                    Dexie schema and default data
src/types/                 Shared types
docs/                      This documentation
.agents/skills/            Vendored agent skills (not part of the app)
```

## Documentation index

- [Architecture](architecture.md) — how the desktop, windows, apps, and state fit together.
- [Adding an app](adding-an-app.md) — register a new app and wire it into the shell.
- [State and persistence](state-and-persistence.md) — where state lives and how it is saved.
- [UI conventions](ui-conventions.md) — palette, layout, icons, and interaction patterns.
- [Development](development.md) — commands, lint baseline, manual QA, troubleshooting.

## Feature summary

- **Desktop** — wallpaper (image/color/gradient), app icons, right-click menu.
- **Window manager** — drag, resize, minimize, maximize/restore, close, focus with z-index.
- **Taskbar** — Start button, app buttons with focus indicators, clock, system tray icons.
- **Start menu** — animated panel, search field, pinned apps, user/power row.
- **File Explorer** — Dexie-backed folders/files, grid/list views, search, context menus,
  create/delete, open text files in Notepad.
- **Notepad** — Redux-backed editor with save/load through Dexie, modified indicator, status bar.
- **Browser** — tabs, address bar, back/forward, bookmarks, history, search engines, YouTube/Vimeo
  playback through embed players, and a clear fallback for sites that block framing.
- **Terminal** — simulated zsh-style shell with file-aware commands, tab completion, command
  history, accent themes, and `exit` to close the window.
- **Settings** — live preview, wallpaper and taskbar customization, display info, about.

## Persistence at a glance

| Data | Store | Key / table |
| --- | --- | --- |
| Windows, focus, Start menu | Zustand (in memory) | — |
| Wallpaper, taskbar color | Zustand + Dexie | `settings` table |
| File system | Dexie | `files` table |
| Notepad document | Redux (in memory) | — |
| Browser bookmarks/history/engine | `localStorage` | `novadesk_browser_*` |

Clearing site data in DevTools resets NovaDesk to a fresh profile.
