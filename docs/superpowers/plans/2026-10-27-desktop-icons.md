# Desktop Icon Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify NovaDesk desktop app icons while keeping them distinct and readable over varied wallpapers.

**Architecture:** Keep the change in the existing desktop icon renderer. Use Tailwind classes to reduce tile chrome, simplify labels, and retain the current React selection and launch handlers.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Fluent UI React icons.

**Spec:** [docs/superpowers/specs/2026-10-27-desktop-icons-design.md](../specs/2026-10-27-desktop-icons-design.md)

## Global Constraints

- Keep the change local to desktop icon presentation and use the existing Fluent icons, React, and Tailwind conventions.
- Preserve single-click selection, double-click launch, and keyboard activation.
- Keep icons and app names legible over varied desktop wallpapers.

## Review Focus

- Bright or visually busy wallpaper: idle icon labels remain readable.
- Selected icon: selection is clear without restoring bulky tile chrome.
- Keyboard focus and Enter/Space: focus is visible and the app still launches.
- Long app names: text remains centered and wraps without clipping.
- Desktop background click or right-click: selection clears and context-menu behavior is unchanged.

---

### Task 1: Simplify desktop app icon styling

**Files:**
- Modify: `src/components/system/Desktop.tsx` (desktop icon button and its icon/label elements)

**Interfaces:**
- Consumes: `appsConfig`, existing `selectedAppId`, and `openApp` handlers.
- Produces: the same icon list, selection state, and launch interactions with reduced visual chrome.
- Test: no test framework is configured; validate visually and run the existing type, lint, and build checks.

- [ ] **Step 1: Inspect the existing icon classes and preserve current interactions**

Confirm the working-tree changes for selection, keyboard activation, and double-click launch remain in place. Do not rewrite or discard those handlers.

- [ ] **Step 2: Simplify the icon backplate and label styling**

In `Desktop.tsx`, use a compact, softly tinted icon backplate with a subtle border and restrained shadow. Keep labels directly below the icons, remove their persistent dark chip, and retain text contrast with the existing text shadow and a quiet hover/selected treatment. Preserve the existing layout and focus-visible ring.

- [ ] **Step 3: Verify the visual and interaction review cases**

Smoke-test on a bright or busy wallpaper, then check selected-state feedback, keyboard focus plus Enter/Space, a wrapped app name, background click deselection, right-click context menu, and double-click launch.

- [ ] **Step 4: Run project validation**

Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Confirm there are no new lint errors beyond the documented baseline.
