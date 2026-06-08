# Phase 5: Collaborative Presence & Role Controls - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase adds real-time visual collaboration cues (colored cursors showing mouse movement of other users, and active card indicators/avatars on cards currently being viewed) and enforces client-side peer permissions (Viewer vs Editor roles).
</domain>

<decisions>
## Implementation Decisions

### Cursor Tracking & Rendering
- **D-01:** Moderate throttling (50-100ms) with smooth CSS transitions on cursor positions. This balances CPU and network performance with animation fluidity.

### Viewer Permissions UX
- **D-02:** Enforce read-only UI. When a user has the Viewer role, edit buttons/inputs are hidden or disabled, card drag-and-drop handles are disabled, and cards are displayed in a read-only modal state.

### Multi-User Card Activity Display
- **D-03:** Render small avatar badges/initials at the top-right corner of cards on the Kanban/Gantt board, and show active users inside the Card Modal.

### Role Selection Location
- **D-04:** Place the role switcher inside the Collaborate Drawer where users input the Room ID to connect.

### the agent's Discretion
- The exact color palettes and styling details for cursor pointers and username badges.
- The specific CSS transition timings/durations for cursor movement.
- The precise layout and design of active user list inside the Card Modal.
</decisions>

<specifics>
## Specific Ideas
- No specific requirements — open to standard approaches
</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Documents
- [ROADMAP.md](file:///.planning/ROADMAP.md) — Defines Phase 5 goals and success criteria.
- [REQUIREMENTS.md](file:///.planning/REQUIREMENTS.md) — Lists requirements (SYNC-04, SYNC-05, ROLE-01, ROLE-02) mapped to this phase.
- [PROJECT.md](file:///.planning/PROJECT.md) — General project constraints and technology stack.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- [useCollaboration](file:///src/hooks/useCollaboration.ts): Handles room connection and sync logic. Currently tracks `activeCardId` via Yjs awareness. Needs adaptation to track cursor coordinates (using viewport-relative coordinates or percentages for responsiveness) and the current user's role.
- [CollaborateDrawer](file:///src/components/CollaborateDrawer.tsx): UI drawer for room connection. Integrate role switcher here.

### Established Patterns
- Client-only architecture: All presence tracking and role checking are client-side only.
- Tailwind CSS v4 styling: Custom Arknights-themed tactical sci-fi styles.

### Integration Points
- `src/components/Board.tsx` and `src/components/GanttTimeline.tsx`: Listen to mouse move events and update local cursor position, and subscribe to collaborator cursor positions to render cursor overlays. Block card/column updates if local role is Viewer.
- `src/components/Card.tsx`: Render avatar indicators for peers currently viewing the card.
- `src/components/CardModal.tsx`: Render peer avatar list viewing the card, and disable/hide edit inputs/buttons if the local user is a Viewer.
</code_context>

<deferred>
## Deferred Ideas
- None — discussion stayed within phase scope
</deferred>

---

*Phase: 05-collaborative-presence-role-controls*
*Context gathered: 2026-06-08*
