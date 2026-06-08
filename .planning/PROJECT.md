# KanbanHarmo

## What This Is

An intuitive and advanced Kanban web application designed specifically for startup project planning. It helps startup teams collaborate seamlessly using peer-to-peer (P2P) real-time synchronization, manage tasks, and visualize project timelines.

## Core Value

Enable rapid, frictionless startup project planning with a highly interactive, collaborative client-side board and Gantt visualization.

## Current Milestone: v2.0 Advanced Collaboration & Multi-Project Support

**Goal:** Enhance the collaborative capability and structure of KanbanHarmo with multi-project support, role-based controls, and rich real-time visual collaboration cues.

**Target features:**
- Project List & Switcher (Kanban board bounded by project)
- Real-time Cursor Tracking (visual pointers during collaboration)
- Multi-user Active Card/View Indicators (showing everyone viewing a card in Kanban & Gantt)
- Due Date & Time Input (allow setting specific times for tasks, not just dates)
- Role-based Collaboration (define reader/writer or owner/collaborator permissions)

## Requirements

### Validated

- [x] Interactive Kanban board with drag-and-drop cards (Phase 1)
- [x] P2P real-time collaborative synchronization via WebRTC and Yjs (Phase 2)
- [x] Rich card details including checklists with progress bars, due dates, priority levels, tags/labels, and custom fields (story points, estimate hours) (Phase 1)
- [x] Interactive Gantt chart with resizable and draggable task duration bars (Phase 3)
- [x] Automation rules: auto-move to Done on checklist completion, auto-high priority near due dates, and a custom rule builder UI (Trigger -> Action) (Phase 3)

### Active

- [ ] Project List & Switcher (Kanban board bounded by project)
- [ ] Real-time Cursor Tracking (visual pointers during collaboration)
- [ ] Multi-user Active Card/View Indicators (showing everyone viewing a card in Kanban & Gantt)
- [ ] Due Date & Time Input (allow setting specific times for tasks, not just dates)
- [ ] Role-based Collaboration (define reader/writer or owner/collaborator permissions)

### Out of Scope

- [ ] Standard centralized backend database/authentication (v1 focuses purely on WebRTC/Yjs P2P sync with local/browser state fallback to keep it serverless and client-driven)
- [ ] Analytics dashboards, burndown charts, velocity calculation (deferred to v2)

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
*Last updated: 2026-06-08 after Milestone v1.0 completion and v2.0 start*
