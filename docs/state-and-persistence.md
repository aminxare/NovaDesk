# State and persistence

NovaDesk deliberately uses four storage mechanisms. Each has a clear owner; mixing them is the main
source of bugs in this codebase.

| Mechanism | Owns | Survives reload | Survives minimize |
| --- | --- | --- | --- |
| Zustand `useSystemStore` | windows, focus, Start menu, personalization | personalization only | yes |
| Redux `notepad` slice | current document, content, modified flag | no | yes |
| Component state | app-local UI | no | **no** (window unmounts) |
| Dexie / `localStorage` | files, settings, browser data | yes | yes |

## Zustand: system store

`src/store/useSystemStore.ts` is a single store created with `create<SystemState>()`.

State:

```ts
openWindows: WindowState[];
focusedWindow: string | null;
isStartMenuOpen: boolean;
highestZIndex: number;
desktopBackground: DesktopBackgroundConfig;
taskbarColor: string;
activeNotepadFile: DBFileItem | null;   // currently unused
```

Actions:

- Windows: `openApp`, `closeApp`, `minimizeApp`, `maximizeApp`, `restoreApp`, `focusApp`.
- Start menu: `toggleStartMenu`, `closeStartMenu`.
- Personalization: `setDesktopBackground`, `setTaskbarColor`, `resetPersonalization`,
  `loadSavedPersonalization`.
- Notepad bridge: `openNotepadWithFile` (incomplete stub), `clearActiveNotepadFile`.

`setDesktopBackground` and `setTaskbarColor` update Zustand immediately and write to Dexie through
`settingsService` without awaiting. `loadSavedPersonalization` is called once from `Desktop` on
mount and hydrates both values.

Defaults are exported constants:

```ts
DEFAULT_BACKGROUND     // image: Windows Bloom
DEFAULT_TASKBAR_COLOR  // rgba(28, 28, 28, 0.9)
```

`settingsService` imports these from the store while the store imports the service. The circular
import is safe only because the constants are read inside methods at call time. Do not use store
exports at module scope inside `settingsService`.

### Adding a system-wide value

1. Add the field and action(s) to `SystemState`.
2. Add the initial value to the store factory.
3. If it should persist, add `getX`/`setX` to `settingsService` and call them from the action and
   from `loadSavedPersonalization` (or a new loader).
4. Add it to `resetPersonalization`/`resetSettings` if it is user-resettable.

## Redux Toolkit: Notepad

Redux exists only for the Notepad document. Wiring:

- `app/providers.tsx` wraps the tree in `<Provider store={store}>`.
- `src/store/store.ts` registers the `notepad` reducer and exports `RootState`/`AppDispatch`.
- `src/store/hooks.ts` exports typed `useAppDispatch` and `useAppSelector`.

`NotepadState`:

```ts
currentFile: DBFileItem | null;
content: string;
isModified: boolean;
isLoading: boolean;
error: string | null;
```

Reducers:

- `setOpenNoticeFile(file)` — loads a file object into state (note the historical "Notice" typo;
  it is the action used by Explorer).
- `setContent(text)` — updates content and sets `isModified: true`.
- `newDocument()` — clears the document.

Thunks:

- `loadFileContent(fileId)` — fetches via `fileService.getFileById`. Not currently dispatched by the
  UI.
- `saveFileContent()` — reads `currentFile`/`content` from state, writes via
  `fileService.updateFileContent`, and clears `isModified` on success. Returns `null` if there is no
  current file.

Known Notepad gap: the toolbar "Open" action only dispatches `setContent(found.content)`, so
`currentFile` is still `null` and saving prompts for a new filename. Explorer's open flow sets both
correctly.

### Adding a Redux slice

1. Create `src/store/fooSlice.ts` with `createSlice` and export the reducer plus actions.
2. Register it in `configureStore({ reducer: { notepad, foo } })`.
3. Use the typed hooks from `src/store/hooks.ts`.
4. Keep async I/O in `createAsyncThunk` and call services, not Dexie directly.

## Dexie: files and settings

`src/db/db.ts` defines the database:

```ts
super('NovaDeskDatabase');

this.version(1).stores({
  files: 'id, parentId, type, name',
  settings: 'key',
});
```

`DBFileItem`:

```ts
interface DBFileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentId: string | null;   // null = root
  size?: string;
  date?: string;             // 'YYYY-MM-DD HH:mm'
  extension?: string;
  content?: string;
}
```

`DBSetting` is `{ key: string; value: any }`. The two keys in use are `desktopBackground` and
`taskbarColor`.

### File service API

Components and thunks use `src/services/fileService.ts`:

```ts
initializeDefaults(): Promise<void>
getAllFiles(): Promise<DBFileItem[]>
getFileById(id): Promise<DBFileItem | undefined>
getFilesByParent(parentId): Promise<DBFileItem[]>
searchFiles(query): Promise<DBFileItem[]>
createFolder(name, parentId): Promise<DBFileItem>
createFile(name, parentId, content = ''): Promise<DBFileItem>
updateFileContent(id, content): Promise<void>
deleteItem(id): Promise<void>   // recursive
```

Behavior worth knowing:

- `initializeDefaults` seeds a demo tree only when `files.count() === 0`. It is called from
  Explorer's mount effect, not from app startup.
- `createFile(name, parentId)` writes the `parentId` it is given. Pass `null` for a root-level file
  and `'documents'` explicitly for a document.
- IDs are timestamp-based (`folder-<ms>`, `file-<ms>`), so two creations in the same millisecond
  could collide.
- `deleteItem` recursively deletes children before the parent.
- `getFilesByParent(null)` queries `equals('')` and therefore does not return root items. Explorer
  avoids it by filtering `getAllFiles()`; fix the service if you need the method.

### Default data duplication

`initializeDefaultFiles()` in `src/db/db.ts` is an older, unused copy of the seed data. The live
path is `fileService.initializeDefaults()`. Change only the service copy, or remove the dead
function in a dedicated cleanup.

### Schema changes

Dexie requires explicit versions. To add an index or table, keep version 1 and add a new version:

```ts
this.version(1).stores({
  files: 'id, parentId, type, name',
  settings: 'key',
});

this.version(2).stores({
  files: 'id, parentId, type, name, extension',
  settings: 'key',
  notes: 'id, updatedAt',
});
```

Existing rows are retained. New tables start empty. If a migration needs data transformation, add
an `.upgrade()` callback to the new version.

## localStorage: Browser app

`useBrowserState` owns browser data and does not use Redux or Zustand.

| Key | Contents |
| --- | --- |
| `novadesk_browser_bookmarks` | `BookmarkItem[]` |
| `novadesk_browser_history` | `HistoryItem[]`, capped at 50, deduplicated by URL |
| `novadesk_browser_engine` | `'google' \| 'duckduckgo' \| 'bing' \| 'wikipedia'` |

Reads happen in lazy `useState` initializers guarded by `typeof window !== 'undefined'`; corrupt
JSON falls back to defaults. Writes are wrapped in `try/catch` so private-mode failures do not
break the app. Tabs themselves are not persisted.

## SSR rules

- Access `window`, `localStorage`, and IndexedDB only in effects, handlers, or guarded initializers.
- Do not seed Dexie at module scope.
- Do not read persisted state during the initial render in a way that changes markup between server
  and client; hydrate it in an effect instead.

## Resetting local data

In browser DevTools:

1. **Application → IndexedDB → `NovaDeskDatabase` → Delete database** removes files and settings.
2. **Application → Local Storage** remove the three `novadesk_browser_*` keys (or clear site data).
3. Reload. Explorer will re-seed the demo tree on first open; settings fall back to defaults.

`resetPersonalization()` in the Settings app only clears the two settings keys; it does not delete
files or browser data.
