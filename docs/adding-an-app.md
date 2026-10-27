# Adding an app

Adding an app takes two files: the component and the registry entry. Desktop icons, the Start
menu, and the taskbar are all generated from the registry, so no other wiring is required.

## 1. Create the component

Put small apps in `src/components/apps/`. If the app grows beyond one file, add a subfolder (see
`browser/` and `settings/`).

`src/components/apps/CounterApp.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import { Add20Regular, Subtract20Regular } from '@fluentui/react-icons';

export const CounterApp: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#0b1120] text-slate-100 select-none">
      <p className="font-mono text-5xl font-bold text-white">{count}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCount((c) => c - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Subtract20Regular />
        </button>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Add20Regular />
        </button>
      </div>
    </div>
  );
};
```

Requirements:

- Start with `'use client'`.
- Use a named export and a PascalCase component name.
- Fill the window: `h-full` plus your own background. The window content area already scrolls.
- Use `select-none` on surfaces where text selection is not useful.
- Match the visual language in [ui-conventions.md](ui-conventions.md).

## 2. Register it

Edit `src/config/apps.config.tsx`:

```tsx
import { Add20Regular } from '@fluentui/react-icons';
import { CounterApp } from '../components/apps/CounterApp';

export const appsConfig: AppConfig[] = [
  // ...existing apps
  {
    id: 'counter',
    title: 'Counter',
    icon: <Add20Regular />,
    content: <CounterApp />,
  },
];
```

- `id` is the window identity. Use a stable kebab-case string; it is also used by `openApp`,
  `focusApp`, and `closeApp`.
- `title` is shown in the window title bar, desktop icon label, taskbar tooltip, and Start menu.
- `icon` should be a Fluent icon (`*20Regular` fits the shell chrome).
- Array order controls the order of desktop icons, taskbar buttons, and pinned Start-menu entries.

Restart the dev server if the registry change does not hot-reload cleanly.

## 3. Opening it programmatically

```tsx
import { appsConfig } from '../../config/apps.config';
import { useSystemStore } from '../../store/useSystemStore';

const { openApp } = useSystemStore();
const config = appsConfig.find((app) => app.id === 'counter');

if (config) {
  openApp({ ...config, title: 'Counter — Session 2' });
}
```

`openApp` accepts `Omit<WindowState, 'isMinimized' | 'isMaximized' | 'zIndex'>`, so spreading an
`AppConfig` works and you can override the title. Opening an app whose `id` is already open focuses
the existing window instead of creating a second one.

For the file-open pattern, see `ExplorerApp.handleOpenFile`: it dispatches
`setOpenNoticeFile(item)` to Redux, then calls `openApp({ ...notepadConfig, title: ... })`.

## 4. State and persistence

Choose the owner that matches the data:

- **App-local UI state** (form inputs, selected row, view mode): `useState` / `useReducer` inside
  the component. Remember that minimizing a window unmounts it and loses this state.
- **Shell-wide state** (affects taskbar, desktop, other apps): add to `useSystemStore`.
- **Rich document state with async persistence**: add a Redux slice following
  `src/store/notepadSlice.ts` and register the reducer in `src/store/store.ts`.
- **Persisted data**: add a service under `src/services/` that wraps Dexie or `localStorage`.
  Components should call the service, not the database directly.

Details: [state-and-persistence.md](state-and-persistence.md).

## 5. Verify

```bash
npx tsc --noEmit
npm run lint      # do not add errors on top of the known baseline
npm run build
```

Manual checks:

- The icon appears on the desktop, taskbar, and Start menu in the expected order.
- Clicking it opens the window; clicking again focuses rather than duplicates it.
- Minimize/maximize/restore/close work, and the window title is correct.
- The app fills the content area without layout overflow at small window sizes.
- Any persisted data survives a page reload.

## Caveats

- **One instance per id.** For multi-document apps, manage documents/tabs inside the app (as the
  Browser does).
- **The registry holds module-scope JSX.** `content` is an element instance, not a factory. If an
  app must reset on every launch, reset its store or key it deliberately.
- **Window geometry is global.** `Window` hard-codes the default size and minimums; per-app sizes
  are not supported yet.
- **Keep `.agents/` out of app changes.** Those are vendored skills, not application code.
