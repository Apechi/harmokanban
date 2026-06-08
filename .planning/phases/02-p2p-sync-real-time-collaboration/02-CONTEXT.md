# Phase 2: P2P Sync & Real-Time Collaboration - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable serverless, real-time collaboration between users using Yjs and WebRTC.

</domain>

<decisions>
## Implementation Decisions

### Room Join & Sharing Interface
- **D-01**: A "Collaborate" button in the header opens a tactical drawer/dropdown. This panel displays the current Room ID (if connected), a "Copy Invite Link" button (appending `?room=id` to the URL), a text input to join other rooms, and a random tactical room code generator (e.g., `OPERATION-SHADOW-451`).
- **D-02**: The application will auto-connect to a room if a `?room` query parameter is present in the URL on page load.

### Local State Merging Strategy
- **D-03**: Auto-Merge with Overwrite Protection. If the joined room is brand new/empty, seed it with the user's current local board state. If the room has active data from other peers, replace the user's local board state with the room's state so all peers are synchronized, but save a backup of the user's local board offline beforehand so no data is permanently lost.

### Operator Presence & Connection Indicator UI
- **D-04**: Display a neon connection status indicator (Green/Cyan for online with peer count, Red for offline).
- **D-05**: Include a "Squad List" in the header showing active operators. Each peer gets a random Arknights operator callsign (e.g., Doctor, Amiya, Texas, Exusiai, or Operator-XXX) stored in Yjs awareness, which they can customize in the collaboration drawer.
- **D-06**: Show visual indicators (e.g., status badges or outline highlights) when an operator is actively viewing/editing a card.

### the agent's Discretion
- WebRTC signaling server URL selection and stun/turn fallback configuration details.
- Exact UI styling of the collaboration drawer/dropdown and its placement in the header.
- Specific mechanics of creating the offline backup before overwriting local state.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Constraints
- [GEMINI.md](file:///w:/project/KanbanHarmo/GEMINI.md) — Technology stack rules (Tailwind CSS v4, Yjs, WebRTC) and database-less P2P design constraints.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- [src/lib/db.ts](file:///w:/project/KanbanHarmo/src/lib/db.ts) — Local IndexedDB load/save state utility, which can be adapted or integrated with y-indexeddb.
- [src/components/Board.tsx](file:///w:/project/KanbanHarmo/src/components/Board.tsx) — Main board container handling drag-and-drop actions.
- [src/app/page.tsx](file:///w:/project/KanbanHarmo/src/app/page.tsx) — App entry point managing board state, header layout, and header controls.

### Established Patterns
- Arknights-style theme colors and monospace typography layout defined in page/components.

### Integration Points
- [src/app/page.tsx](file:///w:/project/KanbanHarmo/src/app/page.tsx) — Hook up the Yjs document, WebRTC provider, and room synchronization context.
- [src/lib/db.ts](file:///w:/project/KanbanHarmo/src/lib/db.ts) — Integrate with `y-indexeddb` for offline persistence of Y.Doc updates.

</code_context>

<specifics>
## Specific Ideas

- "Arknights-style Tactical Squad Presence" for the operator list, status, and collaboration drawer.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-p2p-sync-real-time-collaboration*
*Context gathered: 2026-06-08*
