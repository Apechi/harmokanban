# Roadmap: KanbanHarmo

## Overview

KanbanHarmo is built as a vertical MVP slice-by-slice, delivering full user value at each phase. We start by building the core board and offline-first persistence (Phase 1), layer on real-time collaborative synchronization using WebRTC and Yjs (Phase 2), and conclude by building the interactive Gantt chart timeline and the automation rule builder (Phase 3).

## Phases

- [x] **Phase 1: Core Board & Local Persistence** - Drag-and-drop Kanban board, card details checklist, and IndexedDB local persistence
- [ ] **Phase 2: P2P Sync & Real-Time Collaboration** - WebRTC sync using Yjs and online presence indicators
- [ ] **Phase 3: Gantt Timeline & Automation Builder** - Interactive Gantt view and client-side automation rules engine

## Phase Details

### Phase 1: Core Board & Local Persistence
**Goal:** Build a robust, responsive Kanban board with custom columns, task cards, checklists, priority tags, and client-side persistence.
**Mode:** mvp
**Depends on:** Nothing (first phase)
**Requirements:** BOARD-01, BOARD-02, BOARD-03, BOARD-04, CARD-01, CARD-02, CARD-03, CARD-04, CARD-05
**Success Criteria** (what must be TRUE):
  1. User can view default columns and custom-manage (add, rename, reorder, delete) them.
  2. User can create and edit cards, adding subtask checklists, priorities, custom tags, dates, and story points.
  3. User can drag and drop cards within and across columns with smooth animations.
  4. User's board state is persisted locally to IndexedDB/localStorage and reloaded on page refresh.
**Plans:** Completed

Plans:
- [x] 01-01: Scaffold Next.js project with Tailwind CSS v4 and set up core layout
- [x] 01-02: Implement Kanban Board view with column CRUD and drag-and-drop
- [x] 01-03: Implement Card Details modal, subtasks checklist, custom fields, and local IndexedDB state persistence

### Phase 2: P2P Sync & Real-Time Collaboration
**Goal:** Enable serverless, real-time collaboration between users using Yjs and WebRTC.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** SYNC-01, SYNC-02, SYNC-03
**Success Criteria** (what must be TRUE):
  1. User can input a Room ID to connect to a shared room.
  2. Multi-browser changes sync instantly within the same room.
  3. Network connectivity status and active peer count are visible.
**Plans:** TBD

Plans:
- [ ] 02-01: Integrate Yjs doc structure with local IndexedDB provider
- [ ] 02-02: Setup y-webrtc connection sync and connectivity indicator UI

### Phase 3: Gantt Timeline & Automation Builder
**Goal:** Add timeline visualization and automated workflow rules.
**Mode:** mvp
**Depends on:** Phase 2
**Requirements:** GANTT-01, GANTT-02, AUTO-01, AUTO-02, AUTO-03, AUTO-04
**Success Criteria** (what must be TRUE):
  1. User can toggle between Kanban and Gantt chart views.
  2. Resizing and dragging timeline bars updates card due dates/durations dynamically.
  3. Card automatically moves to Done when subtasks are completed.
  4. User can configure custom Trigger -> Action rules in the builder UI without infinite loop locks.
**Plans:** TBD

Plans:
- [ ] 03-01: Implement Gantt timeline view using SVG rendering with drag and resize mouse events
- [ ] 03-02: Build client-side automation engine with loops prevention and Rule Builder UI

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Board & Local Persistence | 3/3 | Completed | 2026-06-08 |
| 2. P2P Sync & Real-Time Collaboration | 0/2 | Not started | - |
| 3. Gantt Timeline & Automation Builder | 0/2 | Not started | - |
