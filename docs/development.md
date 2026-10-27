# Development

## Prerequisites

- Node.js 20+ (the project targets Next.js 16 / React 19; `@types/node` is v20)
- npm or pnpm. The repo contains both `package-lock.json` and `pnpm-lock.yaml`; choose one and do
  not run both installers against the same tree.

## Setup

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The dev server uses Turbopack.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (compiles, type-checks, prerenders) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint over the whole repo |
| `npx tsc --noEmit` | Type-check only |
| `npx eslint src app` | Lint only application code, skipping `.agents/` noise |

There is no test runner, test script, or CI configuration in this repository.

## Current quality baseline

`npx tsc --noEmit` passes and `npm run build` succeeds. ESLint is **not clean**:

```
✖ 27 problems (8 errors, 19 warnings)
```

Errors:

- 6 × `@typescript-eslint/no-require-imports` in
  `.agents/skills/brainstorming/scripts/server.cjs` (vendored skill code).
- 1 × `react-hooks/set-state-in-effect` in `src/components/apps/ExplorerApp.tsx` (the async
  `loadFiles()` call from the mount effect).
- 1 × `@typescript-eslint/no-explicit-any` in `src/db/db.ts` (`DBSetting.value`).

Warnings are mostly unused variables in vendored scripts plus `NotepadApp.tsx` and
`useSystemStore.ts`.

Treat this as the baseline: do not add new errors, and do not rewrite `.agents/` to silence them.
Use `npx eslint src app` when you want a signal on application code only. (That still reports the
Explorer and `db.ts` errors, which are known.)

## Manual QA

Run through the flows touched by your change. A full smoke pass:

1. **Desktop** — icons render, double-click opens an app, right-click opens the desktop menu,
   New Folder/New File create entries, Refresh reloads.
2. **Windows** — open two apps; focus changes z-order; drag and resize; minimize/restore;
   maximize/restore; close. The taskbar indicator follows focus.
3. **Start menu** — opens/closes from the Start button and outside click; pinned apps launch.
4. **Explorer** — folders navigate, breadcrumbs/back/home work, search filters, grid/list toggle
   works, create folder/file, delete with confirmation, open a text file in Notepad.
5. **Notepad** — edit marks `*`; Save updates Dexie; New clears; reload and reopen the file to
   confirm persistence.
6. **Browser** — new tab, navigate to a URL, search, back/forward, reload, bookmark toggle,
   history list/clear, search engine switch. Paste a YouTube video link and confirm the embed
   player loads; open YouTube home and confirm the explanatory fallback appears. Other
   frame-blocked sites should show the fallback rather than a blank frame.
7. **Settings** — apply wallpaper (image/color/gradient/custom URL), change taskbar color and
   opacity, reset defaults; reload and confirm both persisted.
8. **Terminal** — `help`, `ls`, `cd`, `cat`, `tree`, `find`, `mkdir`, `touch`, `rm`, `echo`,
   `theme`, `neofetch`, Tab completion, arrow-key history, Ctrl+L/Ctrl+C, and `exit` (which
   closes the window). Create a file with `touch`, then use Explorer's Refresh action to confirm
   it appears there.
9. **Responsive** — resize the browser window; apps should remain usable at the 300×200 minimum
   window size.

## Known issues and rough edges

| Area | Issue |
| --- | --- |
| Lint | Baseline is not clean (see above). |
| Windows | Minimizing returns `null` from `Window`, unmounting app-local state (Browser tabs, Terminal scrollback, Explorer navigation). |
| Notepad | Toolbar "Open" sets content but not `currentFile`, so Save then prompts for a new name. |
| Notepad | `useEffect` import and `newFile` variable are unused. |
| Explorer | `fileService.getFilesByParent(null)` uses `equals('')` and returns no root items; Explorer avoids it. |
| Files | `createFile(name, parentId)` honors the `parentId` you pass; pass `'documents'` explicitly for a document, `null` for a root-level file. |
| Files | Default seed data is duplicated in `db.ts` (`initializeDefaultFiles`, unused) and `fileService.initializeDefaults` (live). |
| Files | Seeding runs from Explorer's mount effect, so a fresh profile has no files until Explorer opens. |
| Notepad bridge | `useSystemStore.openNotepadWithFile` is an incomplete stub; `activeNotepadFile` is unused. Explorer uses Redux + `openApp` instead. |
| Browser | Sites that send `X-Frame-Options`/CSP (Google, GitHub, Reddit, ChatGPT, Stack Overflow) cannot be embedded; known blockers show a fallback panel with Open Native/Try anyway. |
| Browser | YouTube/Vimeo video, Shorts, live, and playlist links play via their embed players. YouTube home, search, and channel pages cannot be embedded and show an explanatory panel. |
| Browser | The `novadesk://docs` bookmark has no dedicated page and falls through to the iframe viewer. |
| Start menu | The panel class contains `h180` (missing hyphen), so the intended fixed height does not apply. |
| Packaging | Both npm and pnpm lockfiles are present; `package-lock.json` is currently untracked. |
| Naming | `package.json` is named `win11` while the product is NovaDesk. |

## Troubleshooting

### Port 3000 is in use

```bash
npm run dev -- -p 3001
```

### Stale build or type artifacts

```bash
rm -rf .next tsconfig.tsbuildinfo
npx tsc --noEmit
npm run build
```

### Hydration mismatch

- Access browser APIs only after mount (`useEffect`) or behind `typeof window !== 'undefined'`.
- Do not initialize state from `Date.now()`, `new Date()`, or `localStorage` during render in a way
  that changes server markup.
- Check the console for the component named in the warning.

### Data looks wrong or a migration failed

- DevTools → Application → IndexedDB → `NovaDeskDatabase` → Delete database.
- DevTools → Application → Local Storage → remove `novadesk_browser_*`.
- Reload. Explorer re-seeds the demo tree the next time it opens.

### Browser page is blank or refuses to load

That is usually the site's `X-Frame-Options`/CSP, not an app bug. Known blockers show a fallback
panel with "Open in real browser" and "Try loading anyway". Use the native tab for interactive
sites. YouTube and Vimeo video links are rewritten to their embeddable players, but YouTube home,
search, and channel pages cannot be framed. Google/Bing searches are rewritten to DuckDuckGo HTML
so results render.

### ESLint reports vendored skill scripts

Expected. `.agents/skills/**` is not application code and is not ignored by `eslint.config.mjs`.
Scope the run with `npx eslint src app` instead of editing the vendored files.

### Installer conflicts

If installs behave inconsistently, confirm you are using one package manager. Do not delete a
lockfile without checking with the project owner; the tracked lockfile should match the chosen
manager.

## Change checklist

1. Keep state in the layer that already owns it (see [architecture.md](architecture.md)).
2. Persist through services, not `db` directly.
3. Add `'use client'` to interactive components.
4. Guard browser APIs for SSR.
5. Match the existing dark/cyan visual language (see [ui-conventions.md](ui-conventions.md)).
6. Run `npx tsc --noEmit`, `npx eslint src app`, and `npm run build`.
7. Smoke-test the affected flow and the persistence path.
