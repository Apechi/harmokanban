# Requirements: KanbanHarmo

**Defined:** 2026-06-08
**Core Value:** Enable rapid, frictionless startup project planning with a highly interactive, collaborative client-side board and Gantt visualization.

## v1 Requirements (Completed)

### Board Management (BOARD)

- [x] **BOARD-01**: User can view a Kanban board with default columns (Todo, In Progress, Done)
- [x] **BOARD-02**: User can create, rename, delete, and reorder columns
- [x] **BOARD-03**: User can drag and drop cards within a column and between columns with smooth animations
- [x] **BOARD-04**: Board state persists locally to IndexedDB/localStorage so that data loads immediately on refresh

### Card details & Customization (CARD)

- [x] **CARD-01**: User can create and delete cards inside columns
- [x] **CARD-02**: User can edit card title, description, and assign custom tags/labels
- [x] **CARD-03**: User can set task priority levels (Low, Medium, High) with visual indicators
- [x] **CARD-04**: User can add a checklist of subtasks to a card and view a checklist completion progress bar
- [x] **CARD-05**: User can set start dates, due dates, and custom fields (story points, estimate hours)

### P2P Sync & Real-time Collaboration (SYNC)

- [x] **SYNC-01**: User can connect to a shared collaborative room by specifying a Room ID
- [x] **SYNC-02**: Board updates sync instantly between users in the same room via P2P WebRTC using Yjs
- [x] **SYNC-03**: User can see a network status indicator showing active peer connections

### Gantt Planning (GANTT)

- [x] **GANTT-01**: User can switch to a Gantt timeline view displaying cards as horizontal duration bars
- [x] **GANTT-02**: User can drag task duration bars to update start/due dates, and resize bars to extend/shorten duration

### Automations Builder (AUTO)

- [x] **AUTO-01**: Card automatically moves to the 'Done' column when all checklist subtasks are completed
- [x] **AUTO-02**: Card priority automatically updates to 'High' when it is within 24 hours of its due date
- [x] **AUTO-03**: User can configure basic Trigger -> Action rules using a declarative Rule Builder UI
- [x] **AUTO-04**: Automations engine handles updates without entering infinite recursion loops (using transaction metadata tags)

## v2 Requirements (Completed)

### Multi-Project Support (PROJ)

- [x] **PROJ-01**: User can create, rename, and delete projects, and switch between projects using a project switcher UI.
- [x] **PROJ-02**: The Kanban board and Gantt timeline views, cards, and state are scoped exclusively to the currently active project.

### Collaboration Enhancements (SYNC)

- [x] **SYNC-04**: Real-time cursor pointers of online collaborators are displayed on the board and Gantt view, indicating cursor positions with user name callsigns and colors.
- [x] **SYNC-05**: Multi-user avatars/indicators are displayed on cards in both Kanban and Gantt views when multiple users have a card details modal open.

### Scheduling Details (CARD)

- [x] **CARD-06**: User can specify an exact time (hours and minutes) alongside the date for task start and due dates, which displays readably on the card and timeline.

### Role-Based Access (ROLE)

- [x] **ROLE-01**: User can select a role (e.g., Editor or Viewer) when connecting to a room.
- [x] **ROLE-02**: UI interactions (adding/editing cards, checklist updates, drag-and-drop, and triggers execution) are blocked when the user has the Viewer role.

## v3 Requirements (Active)

### Metrics & Analytics (METRIC)

- [ ] **METRIC-01**: Record card state transition history (timestamps when a card moves columns) in card metadata for local and peer synchronized states.
- [ ] **METRIC-02**: Calculate and display an interactive SVG Burndown Chart showing remaining task count or story points vs ideal completion trajectory.
- [ ] **METRIC-03**: Calculate and visualize team velocity (story points completed per sprint or week) in a custom interactive bar chart.
- [ ] **METRIC-04**: Calculate and display Lead Time (creation to Done) and Cycle Time (In Progress to Done) metrics.
- [ ] **METRIC-05**: Provide interactive distribution breakdown charts (by Column, Priority, and Assignee).
- [ ] **METRIC-06**: All charts must render using lightweight, pure SVG tailored to the tactical monospace theme, complete with interactive mouse-hover details.
- [ ] **METRIC-07**: Introduce a dedicated "Analytics Dashboard" view toggleable from the main layout.

## Out of Scope

- [ ] Standard centralized backend database/authentication (v1 and v2 focus purely on WebRTC/Yjs P2P sync with local/browser state fallback to keep it serverless and client-driven).
- [ ] Custom external integration plugins, e.g. GitHub sync, slack bot (deferred to v4).

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BOARD-01 | Phase 1 | Completed |
| BOARD-02 | Phase 1 | Completed |
| BOARD-03 | Phase 1 | Completed |
| BOARD-04 | Phase 1 | Completed |
| CARD-01 | Phase 1 | Completed |
| CARD-02 | Phase 1 | Completed |
| CARD-03 | Phase 1 | Completed |
| CARD-04 | Phase 1 | Completed |
| CARD-05 | Phase 1 | Completed |
| SYNC-01 | Phase 2 | Completed |
| SYNC-02 | Phase 2 | Completed |
| SYNC-03 | Phase 2 | Completed |
| GANTT-01 | Phase 3 | Completed |
| GANTT-02 | Phase 3 | Completed |
| AUTO-01 | Phase 3 | Completed |
| AUTO-02 | Phase 3 | Completed |
| AUTO-03 | Phase 3 | Completed |
| AUTO-04 | Phase 3 | Completed |
| PROJ-01 | Phase 4 | Completed |
| PROJ-02 | Phase 4 | Completed |
| SYNC-04 | Phase 5 | Completed |
| SYNC-05 | Phase 5 | Completed |
| CARD-06 | Phase 4 | Completed |
| ROLE-01 | Phase 5 | Completed |
| ROLE-02 | Phase 5 | Completed |
| METRIC-01 | Phase 6 | Pending |
| METRIC-02 | Phase 6 | Pending |
| METRIC-03 | Phase 6 | Pending |
| METRIC-04 | Phase 6 | Pending |
| METRIC-05 | Phase 6 | Pending |
| METRIC-06 | Phase 6 | Pending |
| METRIC-07 | Phase 6 | Pending |

**Coverage:**

- v1 requirements: 18 total | 18 completed
- v2 requirements: 7 total | 7 completed
- v3 requirements: 7 total | 0 completed
- Mapped to phases: 32 / 32
- Unmapped: 0 ✓
