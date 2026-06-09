# Phase 9: Card-level Discussion & Comment Threads - Context

**Gathered:** 2026-06-09
**Status:** Complete

<domain>
## Phase Boundary

Build a task-specific comment section inside the Card details modal for structured card discussion, synchronizing comments in real-time using Yjs/WebRTC, and persisting them locally in IndexedDB.

</domain>

<decisions>
## Implementation Decisions

### Comment State Synchronization Structure
- **D-01:** Store comments directly inside the `TaskCard` object (e.g. `card.comments`). This keeps card data cohesive, avoids map-overhead, and automatically syncs/persists with existing board state sync logic.

### IndexedDB Offline Persistence Strategy
- **D-02:** Persist comments naturally as part of the existing project-scoped board state (`board-state-${projectId}`) in IndexedDB. Minimal overhead, matches card-level grouping.

### UI Layout in CardModal
- **D-03:** Create a tab switcher inside `CardModal` to toggle between 'Dossier Details' and 'Communications Feed'. Keeps modal extremely clean.

### Comment Author Identity Mutability
- **D-04:** Lookup the user's active callsign by `senderId` in the peer states. If they rename, past comments update to their new callsign; otherwise fall back to the saved post-time callsign.

### the agent's Discretion
- The exact layout design of the comment form and list inside the 'Communications Feed' tab is left to the agent's discretion, following the monospace, tactical branding of the application.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Roadmap
- [.planning/ROADMAP.md](file:///w:/project/KanbanHarmo/.planning/ROADMAP.md) — Phase 9 boundary definition and success criteria
- [.planning/REQUIREMENTS.md](file:///w:/project/KanbanHarmo/.planning/REQUIREMENTS.md) — CHAT-03, CHAT-04, and CHAT-05 requirement definitions

### Shared Collaboration & State
- [src/types/index.ts](file:///w:/project/KanbanHarmo/src/types/index.ts) — TaskCard schema definition
- [src/lib/collaboration.ts](file:///w:/project/KanbanHarmo/src/lib/collaboration.ts) — Yjs state serialization and mapping
- [src/hooks/useCollaboration.ts](file:///w:/project/KanbanHarmo/src/hooks/useCollaboration.ts) — WebRTC and Yjs providers, user awareness, chat sync handler

### Card Modal UI
- [src/components/CardModal.tsx](file:///w:/project/KanbanHarmo/src/components/CardModal.tsx) — Task details card modal and subtask manager

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useCollaboration.ts`: Can be extended to provide helper methods for adding, editing, or deleting comments on a card.
- `ChatDrawer.tsx` rendering: Reuses monospace chat message styling, timestamp formatting, and owner identification styling.

### Established Patterns
- `syncBoardStateToYjs`: Deep synchronization function of board state to Yjs maps. It can be easily updated to copy the card's comments array (and internal Yjs mappings).

### Integration Points
- `TaskCard` interface in `src/types/index.ts` to include `comments?: Comment[]`.
- `CardModal.tsx` to add a tab switcher for 'Dossier Details' vs 'Communications Feed'.
- `useCollaboration.ts` to support broadcasting card changes when comments are updated.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 09-Card-level Discussion & Comment Threads*
*Context gathered: 2026-06-09*
