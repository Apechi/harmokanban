# KanbanHarmo

## What This Is

An intuitive and advanced Kanban web application designed specifically for startup project planning. It helps startup teams collaborate seamlessly using peer-to-peer (P2P) real-time synchronization, manage tasks, and visualize project timelines.

## Core Value

Enable rapid, frictionless startup project planning with a highly interactive, collaborative client-side board and Gantt visualization.

## Current Milestone: v4.0 Visual Identity & Customization

**Goal:** Provide a configurable look-and-feel system allowing users to select standard themes (Arknights, Arknights Endfield), pick custom accent colors, and configure background overlays.

**Target features:**
- Theme Switcher component (Arknights default dark vs Arknights Endfield warm light/beige)
- Dynamic primary/accent color customizer
- Background overlay controls (opacity adjust, grid pattern toggle)
- Client-side persistence for theme preferences

## Requirements

### Validated

- [x] Interactive Kanban board with drag-and-drop cards (Phase 1)
- [x] P2P real-time collaborative synchronization via WebRTC and Yjs (Phase 2)
- [x] Rich card details including checklists with progress bars, due dates, priority levels, tags/labels, and custom fields (story points, estimate hours) (Phase 1)
- [x] Interactive Gantt chart with resizable and draggable task duration bars (Phase 3)
- [x] Automation rules: auto-move to Done on checklist completion, auto-high priority near due dates, and a custom rule builder UI (Trigger -> Action) (Phase 3)
- [x] Multi-Project Support with switcher sidebar (Phase 4)
- [x] Real-time Cursor Tracking and Active Card Presence Indicators (Phase 5)
- [x] Due Date & exact Time Input support (Phase 4)
- [x] Role-based Collaboration with Editor/Viewer access controls (Phase 5)
- [x] State transition history logging in card metadata (Phase 6)
- [x] Interactive SVG Burndown Chart, Velocity Tracker, and lead/cycle time stats (Phase 6)
- [x] Task distribution breakdown charts (by Column, Priority, Assignee) (Phase 6)
- [x] Interactive Analytics Dashboard View with tactical SVG charts (Phase 6)

### Active

- [ ] Theme selector with Arknights (default dark) and Arknights Endfield (light/beige) themes
- [ ] Accent color selection/override functionality
- [ ] Background overlay customization and opacity settings
- [ ] Theme state client persistence (localStorage / Yjs state)

### Out of Scope

- [ ] Standard centralized backend database/authentication (v1, v2 and v3 focus purely on WebRTC/Yjs P2P sync with local/browser state fallback to keep it serverless and client-driven)
- [ ] Custom external integration plugins, e.g. GitHub sync, slack bot (deferred to v4)

## Context

- The project is initialized as a greenfield Next.js + Tailwind CSS v4 workspace.
- The project will use P2P technologies (WebRTC/Yjs) for local collaborative sync across browsers without requiring a persistent database backend.

## Constraints

- **Tech Stack**: Next.js (React), Tailwind CSS v4, Yjs/WebRTC — startup's chosen tech stack.
- **Data Persistence**: Client-side storage (localStorage / IndexedDB) and WebRTC signaling fallback — constraint of the database-less P2P design.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Tailwind v4 | Developer preference | — Validated |
| P2P WebRTC + Yjs | Desired real-time collaborative sync without centralized database overhead | — Validated |
| Client-side only storage | Match P2P sync model | — Validated |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-09 after Milestone v2.0 completion and v3.0 start*
