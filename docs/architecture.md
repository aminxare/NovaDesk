# Architecture

## Runtime composition

```
app/layout.tsx                  server component: fonts, metadata, global CSS
└── app/providers.tsx           'use client': Redux <Provider>
    └── app/page.tsx            renders <Desktop />
        └── Desktop.tsx         'use client': wallpaper, icons, windows, context menu
            ├── Window[]        react-rnd + framer-motion, one per open app
            │   └── app.content app component from appsConfig
            ├── StartMenu       animated panel (z-50)
            └── Taskbar         app buttons, clock, tray (z-50)
```

`Desktop` fills the viewport (`w-screen h-screen overflow-hidden`). Windows are absolutely
positioned inside it and are bounded to the parent. The taskbar occupies the bottom 48px; maximized
windows use `h-[calc(100%-48px)]`.

## App registry

`src/config/apps.config.tsx` exports `appsConfig: AppConfig[]`:

```ts
interface AppConfig {
  id: string;          // stable window id, also used for focus/minimize/close
  title: string;       // window title and icon label
  icon: React.ReactNode;
  content: React.ReactNode;
}
```

Desktop icons, the Start menu, and the taskbar all read this array. Opening an app is always:

```ts
const { openApp } = useSystemStore();
openApp(appConfig);
```

Because `content` is JSX created at module scope, the registry holds shared element instances.
React still mounts a separate tree per window, but there is no lazy loading or per-launch factory.
For per-launch behavior, reset state through the app's store or add a factory to the registry.

## Window lifecycle

`useSystemStore` owns `openWindows: WindowState[]`:

```ts
interface WindowState {
  id: string;
  title: string;
  icon?: ReactNode;
  content: ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}
```

| Action | Behavior |
| --- | --- |
| `openApp(app)` | Focuses and un-minimizes an existing window with the same id, or appends a new one and focuses it. Closes the Start menu. |
| `focusApp(id)` | Un-minimizes, assigns `highestZIndex + 1`, updates `focusedWindow`, closes the Start menu. |
| `minimizeApp(id)` | Sets `isMinimized`; clears focus if it was focused. |
| `maximizeApp(id)` / `restoreApp(id)` | Toggle `isMaximized`; restore also clears `isMinimized`. |
| `closeApp(id)` | Removes the window; clears focus if it was focused. |
| `toggleStartMenu` / `closeStartMenu` | Controls the Start menu overlay. |

Z-index starts at 10 and increments on every open/focus. Windows therefore sit above desktop
icons but below the taskbar and Start menu (`z-50`).

**Important:** `Window` returns `null` when `isMinimized`, which unmounts the app's component tree.
App-local state (Browser tabs, Terminal scrollback, Explorer navigation) is lost on minimize.
Durable state must live in Zustand, Redux, or Dexie.

Window chrome (`src/components/shared/Window.tsx`) uses `react-rnd` with default geometry
`x=100, y=100, width=800, height=600`, `minWidth=300`, `minHeight=200`. The title bar is the drag
handle. Double-clicking the title bar toggles maximize.

## State ownership

NovaDesk intentionally uses several mechanisms. Keep new state in the layer that already owns that
concern.

| Concern | Owner | Location |
| --- | --- | --- |
| Windows, focus, Start menu | Zustand | `src/store/useSystemStore.ts` |
| Wallpaper, taskbar color | Zustand + Dexie | `useSystemStore` + `settingsService` |
| Notepad document | Redux Toolkit | `src/store/notepadSlice.ts` |
| Browser tabs/bookmarks/history | React state + localStorage | `src/components/apps/browser/useBrowserState.ts` |
| File system | Dexie via service | `src/services/fileService.ts` |
| App registry, presets | Static config | `src/config/*` |

Redux is wired in `app/providers.tsx` and `src/store/store.ts`; use the typed hooks in
`src/store/hooks.ts` (`useAppDispatch`, `useAppSelector`) rather than the raw React Redux hooks.

## Data flows

### Opening and focusing a window

```
user click -> openApp(config) -> Zustand set(openWindows, focusedWindow, highestZIndex)
           -> Desktop re-renders -> <Window app={...}> -> app.content
```

### Personalization

```
Settings UI -> setDesktopBackground(bg)
            -> Zustand set(desktopBackground)          (immediate UI)
            -> settingsService.setBackground(bg)       (Dexie settings.put)
Desktop mount -> loadSavedPersonalization()
              -> settingsService.getBackground()/getTaskbarColor()
              -> Zustand set(...)
```

Writes are fire-and-forget with `.catch(console.error)`; reads are awaited. `resetPersonalization`
clears both Dexie keys and restores the defaults.

### Files

```
Explorer -> fileService.createFolder/createFile/deleteItem -> Dexie files table
         -> loadFiles() -> local fileItems state -> render
Notepad  -> dispatch(saveFileContent()) -> thunk -> fileService.updateFileContent -> Dexie
Explorer open file -> dispatch(setOpenNoticeFile(item)) -> openApp(notepad)
                   -> Notepad reads state.notepad.currentFile/content
```

### Browser

`useBrowserState` is a self-contained hook. It keeps tabs and the active tab in React state,
persists bookmarks/history/search engine to `localStorage`, and models per-tab history as an array
plus an index. `BrowserApp` special-cases `novadesk://newtab`; everything else renders in
`IframeViewer`.

The viewer cannot bypass browser security headers. Instead:

- `getEmbeddableUrl` rewrites YouTube watch/Shorts/live/youtu.be and playlist URLs to
  `youtube-nocookie.com/embed/...`, and Vimeo video URLs to `player.vimeo.com/video/...`.
- Video player iframes receive a permissive sandbox (`allow-same-origin`, scripts, popups,
  presentation) and player permissions; normal pages keep the stricter sandbox without
  `allow-same-origin`.
- `isKnownFrameBlocked` catches common hosts that send `X-Frame-Options`/CSP and renders a
  fallback panel with "Open in real browser" and "Try loading anyway" instead of a blank frame.
- Google/Bing search URLs are rewritten to DuckDuckGo HTML so results can be framed.
- YouTube home, search, and channel pages cannot be embedded; the viewer explains this and asks
  for a video or playlist link.

`novadesk://docs` is still a stub and has no dedicated page handler.

## SSR and the client boundary

The App Router renders `layout.tsx` and `page.tsx` on the server. Every component that touches
state or browser APIs is marked `'use client'`. IndexedDB and `localStorage` are only accessed
inside effects, event handlers, or guarded initializers (`typeof window !== 'undefined'`).

`Desktop` loads saved personalization in a mount effect. `Explorer` seeds defaults and loads files
in a mount effect. Do not move these calls to module scope.

## Extending the shell

- New app: see [adding-an-app.md](adding-an-app.md).
- New persisted setting: see [state-and-persistence.md](state-and-persistence.md).
- New app-specific data type: add it to `src/types/` or the owning store module and export it.
