# Phase 7: Theme Switcher & Styling Customization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in 07-CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-09
**Phase:** 07-Theme Switcher & Styling Customization
**Areas discussed:** Theme Switcher Implementation, Accent Color Application, Background Overlay Options, UI Entry Point & Placement

---

## Theme Switcher Implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Class-based Toggle | Add class to root/body element and override Tailwind v4 CSS variables | ✓ |
| React Context-only state | Inline style object injection | |
| You decide | Let the agent decide | |

**User's choice:** Class-based Toggle (add class to root/body element and override Tailwind v4 CSS variables)
**Notes:** Decided to apply class to root element to clean up style boundaries and leverage Tailwind v4 custom theme layers.

---

## Accent Color Application

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic Hex Picker + Presets | Curated tactical presets + full color picker, injected as root CSS variable | ✓ |
| Fixed Presets Only | Select from static set of 6-8 tactical colors, no custom picker | |
| You decide | Let the agent decide | |

**User's choice:** Dynamic Hex Picker + Presets (tactical presets + full color picker, injected as root CSS variable)
**Notes:** Curated presets allow quick thematic choices, while the picker supports full client flexibility.

---

## Background Overlay Options

| Option | Description | Selected |
|--------|-------------|----------|
| Full Configurator | Grids/scanlines toggles, opacity slider, background image/URL input | ✓ |
| Simple Toggles | Basic on/off options with fixed static overlay | |
| You decide | Let the agent decide | |

**User's choice:** Full Configurator (toggles for grids/scanlines, opacity slider, and selection of background images/URL input)
**Notes:** The user explicitly pointed out that the background overlay can use a picture, so URL input and picture selection presets are added.

---

## UI Entry Point & Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Customization Drawer | Button/icon in the header slides open a right drawer for styling | ✓ |
| Sidebar panel | Settings panel at the bottom of the Project Sidebar | |
| Integrated drawer section | Merge with Collaborate or Automations | |
| You decide | Let the agent decide | |

**User's choice:** Dedicated Customization Drawer (a new button/icon in the header that slides open a right drawer for styling)
**Notes:** Header placement makes theme styling highly visible and easily accessible without cluttering sidebars.

---

## the agent's Discretion
- The exact layout structure and typography within the Customization Drawer.
- Curated color preset values (e.g. tactical hex codes).
- The visual styling and micro-animations for grid transitions.

## Deferred Ideas
- None — discussion stayed within phase scope
