# AGENTS.md

Guidance for AI coding agents working on NovaDesk.

## What this project is

NovaDesk is a Windows 11-style desktop environment that runs entirely in the browser. It is a
Next.js App Router app with React 19, TypeScript, Tailwind CSS v4, Zustand, Redux Toolkit, and
Dexie (IndexedDB). There is no backend: files and settings live in the browser.

The npm package name is `win11`, but the product and UI are named **NovaDesk**.

## Commands

```bash
npm install            # or: pnpm install — pick one package manager, see Gotchas
npm run dev            # http://localhost:3000
npm run build
npm run lint           # baseline is NOT clean; see below
npx eslint src app     # app-only lint (still includes the known baseline errors)
npx tsc --noEmit       # currently passes
```

There is no test framework or test script in this repo.

Lint baseline at the time of writing: **8 errors and 19 warnings**. Six errors come from
`.agents/skills/**` scripts (`@typescript-eslint/no-require-imports`), one from
`src/components/apps/ExplorerApp.tsx` (`react-hooks/set-state-in-effect`), and one from
`src/db/db.ts` (`no-explicit-any`). Do not introduce new lint errors; do not "fix" the baseline
by rewriting vendored skills.

## Repository map

```
app/                        Next.js App Router entry (layout, page, providers, globals.css)
src/components/system/      Desktop, Taskbar, StartMenu
src/components/apps/        One top-level component per app, plus app-specific subfolders
src/components/shared/      Window (react-rnd), ContextMenu
src/config/                 App registry, browser config, personalization presets
src/store/                  Zustand system store + Redux Toolkit notepad slice
src/services/               fileService, settingsService
src/db/                     Dexie database and schema
src/types/                  Shared TypeScript types
public/                     Static assets
.agents/skills/             Vendored agent skills — not app code; do not edit or lint
docs/                       Project documentation
```

## Architecture rules

- **Every interactive component is a client component.** Add `'use client'` at the top of any
  component that uses hooks, browser APIs, or event handlers.
- **Windows are data, not routes.** `appsConfig` in `src/config/apps.config.tsx` is the app
  registry. Desktop icons, the Start menu, and the taskbar all call
  `openApp(appConfig)` from `useSystemStore`; `Window` renders `app.content`.
- **State ownership is split. Do not add a fourth mechanism casually.**
  - Zustand `useSystemStore`: open windows, focus, z-index, Start menu, wallpaper, taskbar color.
  - Redux Toolkit `notepad` slice: Notepad document state and save/load thunks.
  - Local React state + `localStorage`: Browser app (tabs, bookmarks, history, search engine).
  - Dexie `db`: file system items and persisted settings.
- **Components use services, not `db` directly.** File operations go through
  `src/services/fileService.ts`; personalization persistence goes through
  `src/services/settingsService.ts`.
- **Guard browser APIs for SSR.** The app is server-rendered first. Check
  `typeof window === 'undefined'` before touching `window`, `localStorage`, or IndexedDB at module
  or store-initialization time.
- **One app instance per id.** `openApp` focuses an existing window instead of opening a second
  copy. Apps that need multiple documents/tabs manage that internally (see the Browser).
- **The app registry stores JSX elements created at module scope**, so app content is shared
  element instances, not lazy factories. If an app needs fresh state per launch, reset it through
  its store or remount it deliberately.

## Conventions

- Named exports (`export const ExplorerApp = ...`), PascalCase components, `useX` hooks.
- Relative imports are the norm inside `src/`. The `@/*` alias is configured but rarely used;
  match the surrounding file.
- Tailwind utility classes inline; no CSS modules or styled-components. Global CSS is only for
  Tailwind import, theme variables, and Prism token colors.
- Icons: `@fluentui/react-icons`, sized variants such as `Folder20Regular`.
- Palette: dark slate/blue surfaces (`#0b1120`, `#0f172a`, `#111827`), cyan accents, white/10
  borders, `backdrop-blur`, rounded-xl/2xl cards.
- Motion: `framer-motion` for window/Start-menu enter/exit; CSS transitions for hover/focus.
- Context menus: use the shared `ContextMenu` component with `ContextMenuItem[]`; always call
  `preventDefault()` and stop propagation on nested surfaces.
- Toasts/notifications: local component state plus `setTimeout` (2.5s). Keep this pattern unless
  you are intentionally introducing a global notification system.
- TypeScript is `strict`. Avoid `any`; prefer explicit interfaces from `src/types` or the owning
  module.

## Gotchas and known issues

- **Two lockfiles exist** (`package-lock.json` and `pnpm-lock.yaml`). `package-lock.json` is
  currently untracked. Use one package manager consistently; do not regenerate both.
- **Default file seeding is duplicated.** `initializeDefaultFiles()` in `src/db/db.ts` is unused.
  The live path is `fileService.initializeDefaults()`. Change only the service version.
- **`fileService.createFile` honors the `parentId` you pass.** Passing `null` creates a root-level
  file; callers that want a document must pass `'documents'` explicitly.
- **`useSystemStore.openNotepadWithFile` is a no-op stub.** The working flow is: Explorer
  dispatches `setOpenNoticeFile(item)` and then calls `openApp(notepadConfig)` with a custom
  title.
- **Notepad "Open" only replaces the text content**, not `currentFile`; saving afterwards prompts
  for a new filename. Fix this if you touch Notepad.
- **Browser embeds pages in an iframe**, so sites that send `X-Frame-Options`/CSP cannot be
  embedded. Known blockers show a fallback panel instead of a blank frame. YouTube/Vimeo video,
  Shorts, live, and playlist URLs are rewritten to embeddable player URLs by `getEmbeddableUrl`;
  only those player iframes get `allow-same-origin`. YouTube home/search/channel pages still cannot
  be embedded. Google/Bing searches are rewritten to DuckDuckGo HTML. `novadesk://docs` is still a
  stub.
- **`initializeDefaults` runs from Explorer's effect**, not app startup. A fresh profile with no
  Explorer visit has no seeded files.
- **Minimizing unmounts the app.** `Window` returns `null` for minimized windows, so Browser tabs,
  Terminal scrollback, and Explorer navigation are lost. Only Zustand, Redux, Dexie, and
  `localStorage` state survives.
- **`fileService.getFilesByParent(null)` is broken** (`equals('')` never matches root `null`).
  Explorer filters `getAllFiles()` instead; fix the service before relying on it.
- **React 19 lint rule** `react-hooks/set-state-in-effect` flags the async `loadFiles()` call in
  `ExplorerApp`. It is part of the baseline.
- Windows use `react-rnd` with default geometry (100,100 / 800×600) and are bounded to the
  desktop; maximized windows fill the area above the 48px taskbar.

## Before finishing a change

1. `npx tsc --noEmit`
2. `npm run lint` and compare against the baseline above
3. `npm run build`
4. Smoke-test the affected flow in the browser, for example:
   - open/close/minimize/maximize/focus windows, Start menu, taskbar
   - Explorer: create folder/file, delete, open a file in Notepad
   - Notepad: edit and save, reload and reopen
   - Browser: new tab, navigate, back/forward, bookmark
   - Settings: change wallpaper/taskbar color, reload, confirm persistence

## Documentation

- [`docs/README.md`](docs/README.md) — overview, quick start, docs index
- [`docs/architecture.md`](docs/architecture.md) — runtime composition, windows, state, data flow
- [`docs/adding-an-app.md`](docs/adding-an-app.md) — step-by-step guide to adding an app
- [`docs/state-and-persistence.md`](docs/state-and-persistence.md) — Zustand, Redux, Dexie, storage
- [`docs/ui-conventions.md`](docs/ui-conventions.md) — visual and interaction conventions
- [`docs/development.md`](docs/development.md) — commands, lint baseline, troubleshooting
