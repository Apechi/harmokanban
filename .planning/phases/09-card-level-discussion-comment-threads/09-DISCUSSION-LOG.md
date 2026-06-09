# Phase 9: Card-level Discussion & Comment Threads - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-09
**Phase:** 9-Card-level Discussion & Comment Threads
**Areas discussed:** Comment State Synchronization Structure, IndexedDB Offline Persistence Strategy, UI Layout in CardModal, Comment Author Identity Mutability

---

## Comment State Synchronization Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Direct Array in TaskCard | Store comments directly inside the TaskCard object (e.g. card.comments). Simple, keeps card data cohesive, and automatically persists with board updates. | ✓ |
| Separate Y.Map | Store comments in a top-level shared Y.Map (e.g. card-comments), keyed by cardId. Better for performance if cards get hundreds of comments. | |
| You decide | The agent decides the best structural fit based on the codebase patterns. | |

**User's choice:** Direct Array in TaskCard
**Notes:** Reuses the existing deep serialization and Yjs merging methods easily.

---

## IndexedDB Offline Persistence Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Project-scoped Board Storage | Persist comments naturally as part of the existing project-scoped board state (board-state-${projectId}) in IndexedDB. Minimal overhead, matches card-level grouping. | ✓ |
| Separate IndexedDB Store | Add a separate object store/table for comments in IndexedDB. Keep board state object small, load comments only when requested. | |
| You decide | The agent decides the best persistence model. | |

**User's choice:** Project-scoped Board Storage
**Notes:** Storing directly in TaskCard allows comments to automatically write to IndexedDB when the board is saved.

---

## UI Layout in CardModal

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom Scrollable Panel | Render a dedicated monospace, tactical comments section at the bottom of the CardModal (below the checklist). Fits the existing single-column scroll flow. | |
| Dedicated Discussions Tab | Create a tab switcher inside CardModal to toggle between 'Dossier Details' and 'Communications Feed'. Keeps modal extremely clean. | ✓ |
| Side-by-Side Split Panel | Split the CardModal into left (details/checklists) and right (comments feed) panels on desktop screens. Make it feel like an advanced tactical dashboard. | |
| You decide | The agent handles the layout selection. | |

**User's choice:** Dedicated Discussions Tab
**Notes:** Keeps the modal compact and clean, separating metadata/checklist config from active discussion/history feed.

---

## Comment Author Identity Mutability

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic Display | Lookup the user's active callsign by senderId. If they rename, past comments update to their new callsign; otherwise fall back to the saved post-time callsign. | ✓ |
| Frozen at Creation | Hardcode the sender's callsign in the comment object at creation time. Renaming in settings will only affect future comments. | |
| You decide | The agent decides the identity resolution strategy. | |

**User's choice:** Dynamic Display
**Notes:** Leverages the local user's active name and Webrtc awareness list where possible to ensure operator callsigns stay up to date.

---

## the agent's Discretion

The exact visual component layout and monospace visual styling details within the tab are left to the agent's discretion.

## Deferred Ideas

None.
