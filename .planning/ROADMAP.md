# Roadmap: KanbanHarmo

## Overview

KanbanHarmo is built as a vertical MVP slice-by-slice, delivering full user value at each phase.

## Milestones

- ✅ **v1.0 MVP** - Phases 1-3 (shipped 2026-06-08)
- 🚧 **v2.0 Advanced Collaboration & Multi-Project Support** - Phases 4-5 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-3) - Shipped 2026-06-08</summary>

### Phase 1: Core Board & Local Persistence

**Goal:** Build a robust, responsive Kanban board with custom columns, task cards, checklists, priority tags, and client-side persistence.
**Depends on:** Nothing (first phase)
**Requirements:** BOARD-01, BOARD-02, BOARD-03, BOARD-04, CARD-01, CARD-02, CARD-03, CARD-04, CARD-05
**Success Criteria** (what must be TRUE):

  1. User can view default columns and custom-manage (add, rename, reorder, delete) them.
  2. User can create and edit cards, adding subtask checklists, priorities, custom tags, dates, and story points.
  3. User can drag and drop cards within and across columns with smooth animations.
  4. User's board state is persisted locally to IndexedDB/localStorage and reloaded on page refresh.

Plans:

- [x] 01-01: Scaffold Next.js project with Tailwind CSS v4 and set up core layout
- [x] 01-02: Implement Kanban Board view with column CRUD and drag-and-drop
- [x] 01-03: Implement Card Details modal, subtasks checklist, custom fields, and local IndexedDB state persistence

### Phase 2: P2P Sync & Real-Time Collaboration

**Goal:** Enable serverless, real-time collaboration between users using Yjs and WebRTC.
**Depends on:** Phase 1
**Requirements:** SYNC-01, SYNC-02, SYNC-03
**Success Criteria** (what must be TRUE):

  1. User can input a Room ID to connect to a shared room.
  2. Multi-browser changes sync instantly within the same room.
  3. Network connectivity status and active peer count are visible.

Plans:

- [x] 02-01: Integrate Yjs doc structure with local IndexedDB provider
- [x] 02-02: Setup y-webrtc connection sync and connectivity indicator UI

### Phase 3: Gantt Timeline & Automation Builder

**Goal:** Add timeline visualization and automated workflow rules.
**Depends on:** Phase 2
**Requirements:** GANTT-01, GANTT-02, AUTO-01, AUTO-02, AUTO-03, AUTO-04
**Success Criteria** (what must be TRUE):

  1. User can toggle between Kanban and Gantt chart views.
  2. Resizing and dragging timeline bars updates card due dates/durations dynamically.
  3. Card automatically moves to Done when subtasks are completed.
  4. User can configure custom Trigger -> Action rules in the builder UI without infinite loop locks.

Plans:

- [x] 03-01: Implement Gantt timeline view using SVG rendering with drag and resize mouse events
- [x] 03-02: Build client-side automation engine with loops prevention and Rule Builder UI

</details>

### 🚧 v2.0 Advanced Collaboration & Multi-Project Support (In Progress)

**Milestone Goal:** Enhance the collaborative capability and structure of KanbanHarmo with multi-project support, role-based controls, and rich real-time visual collaboration cues.

#### Phase 4: Multi-Project & Time Management

**Goal:** Introduce multi-project boundaries so boards and timelines are partitioned per project, and add exact time specification to dates.
**Depends on:** Phase 3
**Requirements:** PROJ-01, PROJ-02, CARD-06
**Success Criteria** (what must be TRUE):

  1. User can create, rename, and delete projects, and switch between projects via a project switcher sidebar/menu.
  2. Changing the active project dynamically switches the Kanban board and Gantt view, loading only that project's columns, cards, and metadata.
  3. User can specify exact hours/minutes for task dates in the card modal, with time values correctly persisting and displaying in Kanban and Gantt.

**Plans:**

- [x] 04-01: Implement Project List store, scoped project boards, sidebar switcher, and 24h datetime/Gantt timeline enhancements.

#### Phase 5: Collaborative Presence & Role Controls

**Goal:** Add real-time visual collaboration cues (cursors and active card indicators) and enforce client-side peer permissions.
**Depends on:** Phase 4
**Requirements:** SYNC-04, SYNC-05, ROLE-01, ROLE-02
**Success Criteria** (what must be TRUE):

  1. Collaborators can view real-time colored cursor pointers showing mouse movement of other users.
  2. Multi-presence indicators (avatars/badges) are rendered on card elements when multiple users have a card details modal open.
  3. User can choose a role (Viewer or Editor) when connecting to a room, and Viewer users are restricted from adding, deleting, dragging, or updating tasks.

**Plans:** 0/0 plans complete

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Core Board & Local Persistence | v1.0 | 3/3 | Complete | 2026-06-08 |
| 2. P2P Sync & Real-Time Collaboration | v1.0 | 2/2 | Complete | 2026-06-08 |
| 3. Gantt Timeline & Automation Builder | v1.0 | 2/2 | Complete | 2026-06-08 |
| 4. Multi-Project & Time Management | v2.0 | 1/1 | Complete | 2026-06-08 |
| 5. Collaborative Presence & Role Controls | v2.0 | 0/0 | Complete    | 2026-06-08 |
