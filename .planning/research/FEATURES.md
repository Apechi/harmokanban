# Feature Research

This document outlines feature behaviors, UX expectations, and technical scoping for the new collaboration and project management features.

## Feature Breakdown

### 1. Project List & Switcher
- **Table Stakes**:
  - User can create a new project with a name and description.
  - User can view a dropdown or list of projects.
  - Switching projects reloads the Kanban board and Gantt timeline with that project's tasks.
  - Active project ID is stored in the URL (e.g. `?projectId=xyz`) or local state.
- **Data Model**:
  - The root Yjs document can hold a map of projects: `yRootMap.get('projects')`.
  - Each project has its own board state (columns, cards, columnOrder).

### 2. Real-Time Cursor Tracking
- **Table Stakes**:
  - Throttle mouse movements (e.g., 50-100ms) to avoid network congestion.
  - Transmit relative cursor positions (percentage of container width/height or absolute viewport coordinates with header adjustments).
  - Render cursors with a visual pointer, user name (callsign), and distinct colors.
- **UX/Aesthetics**:
  - Use CSS transitions (`transition: all 0.1s ease-out`) for smooth movement instead of jittery updates.
  - Fade out cursors when the user is inactive or leaves the tab.

### 3. Active User Indicators (Kanban & Gantt)
- **Table Stakes**:
  - Show a list of avatar/badge elements on each task card indicating who has that card's details modal open.
  - Show similar indicators in the Gantt timeline.
  - Synchronize this presence via Yjs awareness state (e.g., `state.viewingCardId = cardId`).

### 4. Due Date & Time Fields
- **Table Stakes**:
  - Date inputs must support time specification (e.g. `2026-06-08T16:00`).
  - Render due dates on cards as readable strings (e.g., "June 8, 4:00 PM").
  - The automation engine should respect due times as well (e.g. triggering 24h before exact due time).

### 5. Role-based Collaboration
- **Table Stakes**:
  - Peer role defined locally when connecting (e.g., Creator/Editor or Viewer).
  - Viewer role disables edit buttons, drags, checklist checking, and card creation.
  - Role synced in Yjs awareness so other users see "Amiya-451 (Viewer)".
