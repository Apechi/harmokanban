# KanbanHarmo

## What This Is

An intuitive and advanced Kanban web application designed specifically for startup project planning. It helps startup teams collaborate seamlessly using peer-to-peer (P2P) real-time synchronization, manage tasks, and visualize project timelines.

## Core Value

Enable rapid, frictionless startup project planning with a highly interactive, collaborative client-side board and Gantt visualization.

## Current Milestone: v5.1 Collaboration Notifications & Card Comments

**Goal:** Provide startup teams with real-time collaboration notifications for project, card, and chat updates, along with task card-level comments.

**Target features:**
- Task-specific discussion and comment threads within Card details
- Real-time comment synchronization using Yjs/WebRTC
- Real-time collaboration notifications (toasts and history feed) with distinct styling for different events
- Interactive notifications: clicking on a notification navigates to or opens the respective item (card, chat drawer, or project switcher)
- Monospace/tactical design matching the app's visual identity

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
- [x] Theme selector with Arknights (default dark) and Arknights Endfield (light/beige) themes (Phase 7)
- [x] Accent color selection/override functionality (Phase 7)
- [x] Background overlay customization and opacity settings (Phase 7)
- [x] Theme state client persistence (localStorage / Yjs state) (Phase 7)
- [x] Room Chat Drawer/Panel for real-time peer messaging (Phase 8)

### Active

- [ ] Task card comment threads showing operator identity and message timestamps (Phase 9)
- [ ] Peer-to-peer real-time sync of comments via Yjs (Phase 9)
- [ ] Offline storage and persistence of comment logs via IndexedDB (Phase 9)
- [ ] Real-time collaboration notifications (toasts and feed drawer/dropdown) for chat, card, and project changes
- [ ] Interactive click actions on notifications to open the card modal, room chat, or project switcher

### Out of Scope

- [ ] Standard centralized backend database/authentication (v1-v5 focus purely on WebRTC/Yjs P2P sync with local/browser state fallback to keep it serverless and client-driven)
- [ ] Custom external integration plugins, e.g. GitHub sync, slack bot (deferred to v6)

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
*Last updated: 2026-06-09 after Milestone v5.1 start*
