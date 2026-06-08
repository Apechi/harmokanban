# Phase 4: Multi-Project & Time Management - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase introduces multi-project boundaries so boards and timelines are partitioned per project, and adds exact time specification (hours and minutes) alongside dates for task start and due dates.
</domain>

<decisions>
## Implementation Decisions

### Project Sync & Storage Model
- **D-01:** Separate Yjs rooms/docs. Each project is fully partitioned into its own WebRTC room / IndexedDB document. Changing the active project disconnects from the old room/document and connects to the new one to ensure strict data isolation and speed.
- **D-02:** Project ID/code acts as the room name for P2P sync. A default local project is auto-generated on startup.

### Project Switcher & Management UI Layout
- **D-03:** Left Sidebar. The project listings, quick-switch buttons, and project management controls (create, rename, delete) will be housed in a collapsible tactical sidebar on the left.
- **D-04:** Archive Project on Delete. When a project is deleted, it is hidden from the switcher UI list but its data remains in IndexedDB for potential future recovery.

### Date-Time Input UX & Format
- **D-05:** Combined datetime-local input. Card details modal will feature a unified browser `datetime-local` input to specify exact date and time.
- **D-06:** Tactical 24-Hour Clock. Displays times across Kanban and Gantt in a 24-hour military/tactical format (e.g., '14:30', '09:15') matching the sci-fi aesthetics of the application.

### the agent's Discretion
- The exact color themes for individual project badges/icons in the sidebar can be decided by the agent to ensure high-quality tactical visuals.
- The specific IndexedDB schema keys or storage optimization details are left to the agent's discretion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Documents
- [ROADMAP.md](file:///.planning/ROADMAP.md) — Defines Phase 4 goals and success criteria.
- [REQUIREMENTS.md](file:///.planning/REQUIREMENTS.md) — Lists requirements (PROJ-01, PROJ-02, CARD-06) mapped to this phase.
- [PROJECT.md](file:///.planning/PROJECT.md) — General project constraints and technology stack.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- [useCollaboration](file:///src/hooks/useCollaboration.ts): Handles room connection and sync logic. Needs adaptation to handle dynamic room switches.
- [saveBoardState / loadBoardState](file:///src/lib/db.ts): Basic IndexedDB helpers. Need upgrading to store multiple projects.

### Established Patterns
- Client-only architecture: All board states, rooms, and sync structures are client-driven and serverless.
- Tailwind CSS v4 styling: Custom Arknights tactical sci-fi theme styling throughout components.

### Integration Points
- `src/types/index.ts`: Update `TaskCard` to handle datetime values and define project structures.
- `src/app/page.tsx`: Root page layout needs the Left Sidebar integration and active project state switching.
- `src/components/Board.tsx` and `src/components/GanttTimeline.tsx`: Must restrict display/operations to the currently active project.
</code_context>

<specifics>
## Specific Ideas
- No specific requirements — open to standard approaches
</specifics>

<deferred>
## Deferred Ideas
- None — discussion stayed within phase scope
</deferred>

---

*Phase: 4-Multi-Project & Time Management*
*Context gathered: 2026-06-08*
