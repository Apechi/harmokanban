# Roadmap: KanbanHarmo

## Overview

KanbanHarmo is built as a vertical MVP slice-by-slice, delivering full user value at each phase.

## Milestones

- ✅ **v1.0 MVP** - Phases 1-3 (shipped 2026-06-08)
- ✅ **v2.0 Advanced Collaboration & Multi-Project Support** - Phases 4-5 (shipped 2026-06-09)
- ✅ **v3.0 Analytics & Performance Dashboard** - Phase 6 (shipped 2026-06-09)
- ⏳ **v4.0 Visual Identity & Customization** - Phase 7 (Planned)

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

<details>
<summary>✅ v2.0 Advanced Collaboration & Multi-Project Support (Shipped 2026-06-09)</summary>

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

- [x] 05-01: Implement real-time cursor tracking, multi-presence indicators, and owner-controlled client role assignment.

</details>

<details>
<summary>✅ v3.0 Analytics & Performance Dashboard (Shipped 2026-06-09)</summary>

**Milestone Goal:** Provide startup teams with actionable productivity insights, team velocity tracking, and project completion forecasting using real-time client-side analytics.

#### Phase 6: Analytics & Performance Dashboard

**Goal:** Implement a lightweight, client-side analytics and performance dashboard with interactive SVG charts.
**Depends on:** Phase 5
**Requirements:** METRIC-01, METRIC-02, METRIC-03, METRIC-04, METRIC-05, METRIC-06, METRIC-07
**Success Criteria** (what must be TRUE):

  1. Card schema tracks status transition timestamps in local and synced state.
  2. User can toggle to the Analytics Dashboard view.
  3. Interactive SVG burndown, velocity, lead/cycle time, and distribution charts are rendered and updated in real-time.

**Plans:**

- [x] 06-01: Update TaskCard interface and state to record state transition history/timestamps.
- [x] 06-02: Create local metrics engine/selectors to calculate burndown trajectories, cycle/lead times, and activity distributions.
- [x] 06-03: Implement tactical interactive SVG charts (Burndown, Velocity, and breakdown donut/bar charts).
- [x] 06-04: Implement Dashboard view UI with summary cards, toggle navigation, and real-time state sync.

</details>

<details open>
<summary>⏳ v4.0 Visual Identity & Customization (Planned)</summary>

**Milestone Goal:** Provide a configurable look-and-feel system allowing users to select standard themes (Arknights, Arknights Endfield), pick custom accent colors, and configure background overlays.

#### Phase 7: Theme Switcher & Styling Customization

**Goal:** Implement visual customization settings including built-in themes, accent colors, and background overlay style controls.
**Depends on:** Phase 6
**Requirements:** THEME-01, THEME-02, THEME-03, THEME-04
**Success Criteria** (what must be TRUE):

  1. User can choose between "Arknights" and "Arknights Endfield" themes with styling applied immediately.
  2. User can pick a custom accent color (or select from presets) that overrides the primary brand color in highlights/borders/shadows.
  3. User can enable/disable grid lines and adjust the opacity of the background overlay.
  4. Theme choices are saved and persist across page reloads.

**Plans:**

- [ ] 07-01: Implement theme context provider, Tailwind CSS variable overrides, and Endfield light-mode theme variables.
- [ ] 07-02: Build the Theme Settings/Customization drawer or panel.
- [ ] 07-03: Implement custom color picker / vibe controls and background overlay config.

</details>

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Core Board & Local Persistence | v1.0 | 3/3 | Complete | 2026-06-08 |
| 2. P2P Sync & Real-Time Collaboration | v1.0 | 2/2 | Complete | 2026-06-08 |
| 3. Gantt Timeline & Automation Builder | v1.0 | 2/2 | Complete | 2026-06-08 |
| 4. Multi-Project & Time Management | v2.0 | 1/1 | Complete | 2026-06-08 |
| 5. Collaborative Presence & Role Controls | v2.0 | 1/1 | Complete | 2026-06-09 |
| 6. Analytics & Performance Dashboard | v3.0 | 4/4 | Complete | 2026-06-09 |
| 7. Theme Switcher & Styling Customization | v4.0 | 0/3 | Planned | |
