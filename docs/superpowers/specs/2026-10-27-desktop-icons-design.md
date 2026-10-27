# Desktop Icon Style Design

## Intent

Make NovaDesk's desktop icons feel more modern, simple, and easy to scan while retaining
the current wallpaper-aware desktop and familiar selection and open interactions.

## Goals and constraints

- Reduce the visual weight of the icon tiles and label backgrounds.
- Keep icons and app names legible over varied desktop wallpapers.
- Preserve single-click selection, double-click launch, and keyboard activation.
- Keep the change local to desktop icon presentation and use the existing Fluent icons,
  React, and Tailwind conventions.

## Non-goals

- Changing desktop layout, app ordering, icon assets, or launch behavior.
- Adding icon customization or new state/persistence.

## Approaches

1. **Icons directly on wallpaper:** the most minimal, but labels can be hard to read on
   busy or bright backgrounds.
2. **Softly tinted icon backplates (recommended):** retain a compact, subtle backplate
   for icon contrast while simplifying the label treatment and selection surface.
3. **Simplified glass tiles:** preserve the current raised tiles and reduce their
   visual weight; this changes less, but keeps more of the chrome the request aims to
   simplify.

The user approved the recommended softly tinted backplates approach.
