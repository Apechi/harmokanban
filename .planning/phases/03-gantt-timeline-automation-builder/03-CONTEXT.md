# Phase 3: Gantt Timeline & Automation Builder - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Add interactive Gantt timeline visualization and automated workflow rules engine.

</domain>

<decisions>
## Implementation Decisions

### Gantt Timeline Zoom & Zoom Scale
- **D-01:** Segmented header toggle to switch between "Kanban" and "Gantt" views.
- **D-02:** Gantt timeline supports Days, Weeks, and Months zoom filters for layout flexibility.

### Handling Unscheduled Cards
- **D-03:** "Unscheduled Tasks" sidebar drawer inside the Gantt view lists all cards without start/due dates, allowing users to drag them onto the timeline grid to schedule them.

### Interactive Sync on Timeline
- **D-04:** Updates during dragging/resizing are handled locally for smooth UI. State updates are committed and broadcast to Yjs/WebRTC peers only on drag-end and resize-end to prevent network jitter/sync collisions.

### Automations Builder UI & Loop Prevention
- **D-05:** "Automations Console" sidebar drawer styled with Arknights tactical console look to manage trigger-action rules.
- **D-06:** Loop prevention is enforced by tagging automation updates with `origin: "automation"` in Yjs transaction metadata, preventing recursive trigger executions.

### the agent's Discretion
- The exact layout design of the Gantt timeline bars, SVG grid rendering math, and resize handles.
- The precise Yjs transaction tagging mechanism and data structures for declarative trigger/action rules.
- Color palette variants for the automation rules builder drawer and Gantt grids.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Constraints
- [GEMINI.md](file:///w:/project/KanbanHarmo/GEMINI.md) — Technology stack rules (Next.js, Tailwind CSS v4, Yjs, WebRTC) and database-less design constraints.
- [01-CONTEXT.md](file:///w:/project/KanbanHarmo/.planning/phases/01-core-board-local-persistence/01-CONTEXT.md) — Arknights tactical/sci-fi styling guidelines, typography, and card aesthetic rules.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- [src/types/index.ts](file:///w:/project/KanbanHarmo/src/types/index.ts) — Core interfaces `TaskCard`, `BoardState`. We must add `startDate` field (as `string | null`) to `TaskCard` to support Gantt.
- [src/hooks/useCollaboration.ts](file:///w:/project/KanbanHarmo/src/hooks/useCollaboration.ts) — Handles Yjs document and WebRTC provider. Custom updates must broadcast state changes properly.

### Established Patterns
- Share Tech Mono for monospace styling, deep slate/violet theme colors, and Outfit/Inter fonts for headers.

### Integration Points
- [src/app/page.tsx](file:///w:/project/KanbanHarmo/src/app/page.tsx) — Toggle button for views, routing of Gantt/Kanban components.
- [src/components/Board.tsx](file:///w:/project/KanbanHarmo/src/components/Board.tsx) — Main workspace component where Kanban is rendered.

</code_context>

<specifics>
## Specific Ideas

- Arknights tactical styling details for Gantt chart bars (clean thin glowing outlines, corner bracket accents, and monospace status labels).
- Automations Console styled like an industrial tactical terminal with monospace input fields and graffiti status stickers.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-Gantt Timeline & Automation Builder*
*Context gathered: 2026-06-08*
