# Phase 7: Theme Switcher & Styling Customization - Context

**Gathered:** 2026-06-09
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase implements visual customization settings including built-in themes ("Arknights" dark tactical theme and "Arknights Endfield" light theme), custom accent colors (presets and color picker), and background overlay style controls (opacity slider, grid lines toggle, scanlines styling, and custom picture selection/URL input).
</domain>

<decisions>
## Implementation Decisions

### Theme Switcher Implementation
- **D-01:** Implement theme switching via a Class-based Toggle. Toggling a theme applies a class (e.g. `theme-endfield` or `light`) to the root HTML or body element. Styling variables (such as background, cards, and borders) are defined in `globals.css` and are overridden based on these classes.

### Accent Color Customization
- **D-02:** Implement a Dynamic Hex Picker + Presets system. Provide a set of curated tactical color presets alongside a standard HTML color picker for any custom hex color. Save the selected color and inject it as a root CSS variable (`--color-brand-accent`) so that all dependent highlights, borders, and shadows dynamically update.

### Background Overlay Configuration
- **D-03:** Implement a Full Configurator for background overlays. This includes toggle switches for grid lines and scanlines, a transparency/opacity slider (e.g., 0% to 20%), and options to select a custom picture (presets or dynamic image URL input) that overrides the default background texture.

### UI Entry Point & Placement
- **D-04:** Place customization controls inside a Dedicated Customization Drawer. A new button/icon in the main header will slide open a right-side drawer containing all visual styling customization inputs.

### Theme Preferences Persistence
- **D-05:** Persist all theme choices, accent colors, and background overlay configurations client-side in local storage so they are automatically re-applied on page reload.

### the agent's Discretion
- The exact layout structure and typography within the Customization Drawer.
- The preset tactical accent colors and default background image selections.
- The styling/animation of scanlines and grid transitions.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning & Requirements
- [.planning/ROADMAP.md](file:///.planning/ROADMAP.md) — Defines Phase 7 goals and success criteria.
- [.planning/REQUIREMENTS.md](file:///.planning/REQUIREMENTS.md) — Lists requirements (THEME-01 through THEME-04) mapped to this phase.
- [.planning/PROJECT.md](file:///.planning/PROJECT.md) — General project constraints and technology stack.

### Styling & Configurations
- [src/app/globals.css](file:///src/app/globals.css) — Core styling, Tailwind v4 theme variables, and existing tactical classes.
- [src/app/layout.tsx](file:///src/app/layout.tsx) — Main layout rendering the global overlay structure.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- [src/app/globals.css](file:///src/app/globals.css): Tailwind CSS v4 variables configuration (`@theme`) and existing tactical styles like `.tacticool-card` and `.tactical-bg-overlay`.
- [src/app/page.tsx](file:///src/app/page.tsx): Main screen where the sidebar, board, and drawers are structured.

### Established Patterns
- Client-side only state persistence (localStorage / IndexedDB).
- Custom tactical drawer component design (reusing styling patterns from `CollaborateDrawer.tsx` or `AutomationConsole.tsx`).

### Integration Points
- `src/app/layout.tsx`: Root HTML/body element class binding for the theme switcher, and container for background overlays.
- `src/app/globals.css`: Theme-scoped CSS variables overrides and scanlines/grid styles.
- `src/app/page.tsx`: Render trigger button in header and coordinate Customization Drawer state.
</code_context>

<specifics>
## Specific Ideas
- The background overlay can use a picture (selectable from presets or custom URL input) as a backdrop pattern.
</specifics>

<deferred>
## Deferred Ideas
- None — discussion stayed within phase scope
</deferred>

---

*Phase: 07-theme-switcher-styling-customization*
*Context gathered: 2026-06-09*
