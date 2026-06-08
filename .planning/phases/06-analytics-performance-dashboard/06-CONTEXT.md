# Phase 6: Analytics & Performance Dashboard - Context

**Gathered:** 2026-06-09
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase implements a lightweight, client-side analytics and performance dashboard with interactive SVG charts. It tracks status transition history for task cards and provides productivity insights (burndown, velocity, lead/cycle time, and distribution charts) rendered dynamically using pure SVG tailored to the tactical monospace theme.
</domain>

<decisions>
## Implementation Decisions

### Assignee Definition
- **D-01:** Add a manual text-based "Assignee" field to the `TaskCard` schema and Card Details Modal, enabling manual typing of assignee names. The metrics engine and distribution charts will dynamically group tasks by these name strings.

### State Transition History
- **D-02:** Record status transition history as a list of timestamped events on the card schema: `statusHistory: { columnId: string; timestamp: number }[]`. This transition history will be synchronized in real-time via Yjs/WebRTC and persisted locally to calculate burndown, velocity, and cycle times.

### Dashboard Navigation
- **D-03:** Add a third view mode tab ("Analytics") to the existing segmented switcher (Kanban / Gantt) in the main page header. Toggling to "Analytics" replaces the main workspace canvas with the Analytics Dashboard view.

### Velocity Chart Windowing
- **D-04:** Compute weekly team velocity using rolling 7-day intervals counting backward from the current date. The velocity value is calculated as the sum of story points of cards that transitioned to the "DONE" column within each 7-day window.

### SVG Theme & Interactivity
- **D-05:** Render all charts using lightweight, inline SVGs matching the Arknights sci-fi aesthetics (deep slate backgrounds, neon accents, Share Tech Mono font). Hover states on chart elements will display precise coordination details using tooltips.

### the agent's Discretion
- The design of tooltips, gridlines, hover animations on charts.
- The layout structure of the dashboard elements and summary cards.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning & Requirements
- [.planning/ROADMAP.md](file:///.planning/ROADMAP.md) — Defines Phase 6 goals and success criteria.
- [.planning/REQUIREMENTS.md](file:///.planning/REQUIREMENTS.md) — Lists requirements (METRIC-01 through METRIC-07) mapped to this phase.
- [.planning/PROJECT.md](file:///.planning/PROJECT.md) — General project constraints and technology stack.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- [src/types/index.ts](file:///src/types/index.ts): Holds the `TaskCard` schema definitions.
- [src/app/page.tsx](file:///src/app/page.tsx): Main container that coordinates view modes and renders the board/Gantt components.
- [src/components/CardModal.tsx](file:///src/components/CardModal.tsx): Component for card details and editing.

### Established Patterns
- Client-only state management, IndexedDB storage fallback, and Yjs WebRTC collaboration.
- Custom Arknights-themed tactical sci-fi styles (Tailwind CSS v4).

### Integration Points
- `src/types/index.ts` (adding `assignee` and `statusHistory` to `TaskCard`).
- `src/components/CardModal.tsx` (assignee input UI field).
- `src/app/page.tsx` (viewMode state and segmented control update to include "Analytics").
- New components: `src/components/AnalyticsDashboard.tsx` and custom SVG charts.
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

*Phase: 06-analytics-performance-dashboard*
*Context gathered: 2026-06-09*
