# UI conventions

NovaDesk's visual language is a dark, Fluent-inspired glass desktop. It should read as a coherent
operating system, not a collection of web pages.

## Palette

Surfaces are dark slate/blue; interactive accents are cyan. There are no design tokens for app
surfaces yet, so reuse the established literals.

| Role | Values |
| --- | --- |
| Window chrome | `#202020`, title bar `#111827` (focused) / `#0f172a` (unfocused) |
| Window content base | `#0b1120` |
| Desktop/system surfaces | `#0f172a`, `#111827`, `#0b101b`, `#070b14` |
| Settings surfaces | `#0b1329`, `#080d1c`, `#11192e` |
| Browser surfaces | `#070e1a`, `#0f172a`, `#141e33`, `#121c30` |
| Notepad surfaces | `#1e1e1e`, `#2d2d2d`, `#181818` |
| Terminal surface | `#050816`, header `#0f172a` |
| Borders | `border-white/10`, `border-white/5` for subtle dividers |
| Primary accent | `cyan-400` / `cyan-300` / `cyan-500` |
| Success | `emerald-400` / `emerald-500` |
| Danger | `rose-400` / `rose-500` |
| Folder icon | `amber-400` |
| File icon | `sky-400` |
| Image icon | `purple-400` |
| Download icon | `emerald-400` |

Common background treatments: `bg-[#0f172a]/90`, `bg-[#111827]/70`, `bg-white/5` for raised
controls, `backdrop-blur-md` / `backdrop-blur-xl` for overlays, and `shadow-xl` / `shadow-2xl` for
floating surfaces.

## Typography

- Body text currently renders in Arial via `app/globals.css`. Geist is loaded in `app/layout.tsx`
  as `--font-geist-sans` / `--font-geist-mono` and exposed to Tailwind's theme, but the global body
  rule takes precedence.
- Default UI size is `text-xs` (12px). Use `text-[10px]` / `text-[11px]` for metadata, counts, and
  status bars, `text-sm` for primary content, and `text-xl` for settings page titles.
- Use `font-mono` for technical values: paths, sizes, timestamps, URLs, status bars, terminal.
- Use `font-semibold` / `font-bold` sparingly for headers and active states.
- Truncate long names: `truncate`, plus `min-w-0` on the flex parent.

## Icons

- Use `@fluentui/react-icons` only. Match the 20px family (`Folder20Regular`,
  `Document20Regular`, `Settings20Regular`, ...).
- Sizes: `h-4 w-4` inside toolbars and menus, `h-5 w-5` / `h-6 w-6` in cards and empty states,
  `h-7 w-7` / `h-8 w-8` for hero icons.
- Icons are decorative next to labels; color them by role (cyan interactive, amber folders, etc.)
  rather than inheriting plain white.
- Icon-only buttons need a `title` and, where practical, an `aria-label`.

## Window chrome

`src/components/shared/Window.tsx` defines the frame:

- Rounded `rounded-xl`, `border border-white/10`, `shadow-2xl`, dark `#202020` body.
- 40px title bar (`h-10`) with a 1px bottom border; focused title bar is slightly lighter.
- Title: icon + `text-sm font-medium` in white.
- Controls: minimize, maximize/restore, close, each `h-7 w-7 rounded-md`. Close hovers red;
  the others hover `bg-white/10`.
- Maximized windows drop rounding and borders and fill the area above the 48px taskbar.
- App content sits in a `flex-1 overflow-auto` area.

Do not add app-specific title bars; use the shared `Window` chrome.

## Desktop icons

`Desktop` renders `appsConfig` as a top-to-bottom, wrapping column. Each cell is 96×112:

- A 56px frosted tile (`bg-slate-950/40`, `border-white/15`, `backdrop-blur-md`) holds a 32px
  white icon with a drop shadow.
- The label sits on a translucent dark pill (`bg-slate-950/55`) with a text shadow and is clamped
  to two lines.
- Hover lifts the tile slightly; a single click selects the cell with a cyan wash and ring;
  double-click or Enter/Space opens the app.
- Keep the scrim. Wallpapers are arbitrary, so bare white labels are not reliably readable.

## App layout pattern

Most apps follow this structure:

```tsx
<div className="flex h-full flex-col bg-[#0b1120] text-slate-100 select-none">
  {/* header / toolbar */}
  <div className="border-b border-white/10 bg-[#0f172a]/95 px-3 py-2">...</div>

  {/* body */}
  <div className="flex-1 overflow-y-auto p-4">...</div>

  {/* optional status bar */}
  <div className="border-t border-white/10 bg-[#0d1424] px-4 py-1.5 text-[11px] font-mono text-slate-400">
    ...
  </div>
</div>
```

Explorer uses a sidebar (`w-56 shrink-0 border-r`) plus a scrolling content pane. Settings uses a
sidebar that becomes horizontal on small screens (`flex-col md:flex-row`). Browser uses stacked
bars above a flexible iframe area.

Windows can be as small as 300×200, so avoid fixed widths that cannot shrink; use `min-w-0`,
`truncate`, `flex-wrap`, and responsive grids (`grid-cols-2 sm:grid-cols-4`).

## Controls

- Buttons: `rounded-md`/`rounded-lg`/`rounded-xl`, `hover:bg-white/10`, `transition-colors`,
  `cursor-pointer`. Primary actions use `bg-cyan-500 text-slate-950 hover:bg-cyan-400`.
- Inputs: dark field (`bg-[#080d1c]` or `bg-[#141e33]`), `border-white/10`, and a cyan focus
  state (`focus:border-cyan-400`, optionally `focus-within:ring-2 ring-cyan-400/20`).
- Selected items: `bg-cyan-500/20` + `border-cyan-400/50` (or `ring-2 ring-cyan-400/50` for
  presets).
- Disabled controls: `disabled:opacity-30` and no pointer feedback.
- Destructive actions: rose text/background on hover and a confirmation before deleting.
- Cards: `rounded-2xl`/`rounded-3xl`, `border border-white/10`, `bg-[#11192e]/90` or
  `bg-[#111827]/70`, `shadow-xl`.
- Empty states: centered muted icon (`opacity-40`) plus a short `text-sm` message.

## Context menus

Use `src/components/shared/ContextMenu.tsx` and its `ContextMenuItem` shape
(`label`, optional `icon`, `onClick`, `disabled`, `danger`).

- Call `e.preventDefault()` and `e.stopPropagation()` on the surface that owns the menu.
- On nested items (files, folders), stop propagation so the parent menu does not also open.
- Close the menu on background click and after an action; `ContextMenu` handles outside clicks.
- Menus are `fixed z-50`, `rounded-xl`, `bg-[#0f172a]/95`, `backdrop-blur-xl`, `text-xs`.

## Notifications

The established pattern is a local toast:

```tsx
const [notification, setNotification] = useState<string | null>(null);

const showNotification = (msg: string) => {
  setNotification(msg);
  setTimeout(() => setNotification(null), 2500);
};
```

Render it near the top-right of the app surface (`absolute top-12 right-4 z-50`), with a colored
translucent background, an icon, and `rounded-xl`. Do not add a global toast library unless the
feature requires cross-app notifications.

## Motion

- Window and Start-menu enter/exit: `framer-motion`, `opacity 0 → 1`, `scale 0.95 → 1`,
  `y` offset for the Start menu, `duration: 0.15`.
- Wallpaper and taskbar changes: `transition-all duration-300 ease-in-out`.
- Hover affordances: `transition-colors`, `transition-transform`, occasional
  `group-hover:scale-105` on thumbnails.
- Keep animation subtle and fast; this is an OS shell, not a marketing page.

## Responsiveness and interaction

- The desktop is fixed to the viewport; the page itself must not scroll (`overflow-hidden`).
- Use `select-none` on OS chrome and app surfaces; allow selection in the Notepad textarea and
  inputs.
- Double-click opens desktop icons and files; single click selects. Right-click opens context
  menus.
- Keep the taskbar and Start menu above windows (`z-50`).
- Avoid browser-native `alert`/`prompt` in new UI where an in-app dialog is reasonable. Existing
  code uses them for quick file operations; follow the app's current pattern when extending it,
  but prefer a styled dialog for new user-facing flows.

## Do / don't

| Do | Don't |
| --- | --- |
| Reuse the shared `Window`, `ContextMenu`, and Fluent icons | Build one-off window frames or import another icon set |
| Use `cyan` for interaction and role colors for file types | Use arbitrary accent colors per app |
| Keep app surfaces dark with `white/10` borders | Introduce light themes or opaque white panels |
| Truncate and wrap for 300px-wide windows | Hard-code wide layouts |
| Persist through services | Import `db` directly in components |
| Keep animations at ~150ms | Add long or looping decorative animations |
