# Requirements: KanbanHarmo

**Defined:** 2026-06-08
**Core Value:** Enable rapid, frictionless startup project planning with a highly interactive, collaborative client-side board and Gantt visualization.

## v1 Requirements

### Board Management (BOARD)

- [ ] **BOARD-01**: User can view a Kanban board with default columns (Todo, In Progress, Done)
- [ ] **BOARD-02**: User can create, rename, delete, and reorder columns
- [ ] **BOARD-03**: User can drag and drop cards within a column and between columns with smooth animations
- [ ] **BOARD-04**: Board state persists locally to IndexedDB/localStorage so that data loads immediately on refresh

### Card details & Customization (CARD)

- [ ] **CARD-01**: User can create and delete cards inside columns
- [ ] **CARD-02**: User can edit card title, description, and assign custom tags/labels
- [ ] **CARD-03**: User can set task priority levels (Low, Medium, High) with visual indicators
- [ ] **CARD-04**: User can add a checklist of subtasks to a card and view a checklist completion progress bar
- [ ] **CARD-05**: User can set start dates, due dates, and custom fields (story points, estimate hours)

### P2P Sync & Real-time Collaboration (SYNC)

- [ ] **SYNC-01**: User can connect to a shared collaborative room by specifying a Room ID
- [ ] **SYNC-02**: Board updates sync instantly between users in the same room via P2P WebRTC using Yjs
- [ ] **SYNC-03**: User can see a network status indicator showing active peer connections

### Gantt Planning (GANTT)

- [ ] **GANTT-01**: User can switch to a Gantt timeline view displaying cards as horizontal duration bars
- [ ] **GANTT-02**: User can drag task duration bars to update start/due dates, and resize bars to extend/shorten duration

### Automations Builder (AUTO)

- [ ] **AUTO-01**: Card automatically moves to the 'Done' column when all checklist subtasks are completed
- [ ] **AUTO-02**: Card priority automatically updates to 'High' when it is within 24 hours of its due date
- [ ] **AUTO-03**: User can configure basic Trigger -> Action rules using a declarative Rule Builder UI
- [ ] **AUTO-04**: Automations engine handles updates without entering infinite recursion loops (using transaction metadata tags)

## v2 Requirements

### Analytics & Reports

- **ANL-01**: Burn-down charts and velocity tracking dashboard

### Centralized Storage & Auth

- **DB-01**: Centralized OAuth database authentication (Google, GitHub)
- **DB-02**: Cloud database backup and sync persistence

## Out of Scope

| Feature | Reason |
|---------|--------|
| Centralized backend server | Deferring to keep the application serverless and P2P first |
| File attachments storage | Browser-based storage allocation constraints |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BOARD-01 | Phase 1 | Pending |
| BOARD-02 | Phase 1 | Pending |
| BOARD-03 | Phase 1 | Pending |
| BOARD-04 | Phase 1 | Pending |
| CARD-01 | Phase 1 | Pending |
| CARD-02 | Phase 1 | Pending |
| CARD-03 | Phase 1 | Pending |
| CARD-04 | Phase 1 | Pending |
| CARD-05 | Phase 1 | Pending |
| SYNC-01 | Phase 2 | Pending |
| SYNC-02 | Phase 2 | Pending |
| SYNC-03 | Phase 2 | Pending |
| GANTT-01 | Phase 3 | Pending |
| GANTT-02 | Phase 3 | Pending |
| AUTO-01 | Phase 3 | Pending |
| AUTO-02 | Phase 3 | Pending |
| AUTO-03 | Phase 3 | Pending |
| AUTO-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-08*
*Last updated: 2026-06-08 after initial definition*
