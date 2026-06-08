# Phase 3: Gantt Timeline & Automation Builder - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 03-Gantt Timeline & Automation Builder
**Areas discussed:** Gantt Timeline Zoom & Zoom Scale, Handling Unscheduled Cards, Interactive Sync on Timeline, Automations Builder UI & Loop Prevention

---

## Gantt Timeline Zoom & Zoom Scale

| Option | Description | Selected |
|--------|-------------|----------|
| Segmented header toggle + Day/Week/Month zoom | Segmented toggle control in the page header with multi-zoom filters on the Gantt timeline | ✓ |
| Sidebar toggle + fixed weekly zoom | Sidebar view switcher and simple fixed weekly scale | |

**User's choice:** Segmented header toggle (Kanban vs Gantt) + Daily/Weekly/Monthly zoom controls in Gantt view.
**Notes:** Reuses the existing Arknights-style theme header.

---

## Handling Unscheduled Cards

| Option | Description | Selected |
|--------|-------------|----------|
| Unscheduled Cards Sidebar | A side drawer or collapsible panel listing tasks without dates, letting users drag them onto the timeline grid | ✓ |
| Auto-Scheduling Fallback | Auto-default tasks to today with a 1-day range and display warning indicators | |

**User's choice:** Unscheduled Cards Sidebar: A clean panel on the Gantt view showing undated cards, which users can drag onto the timeline grid to schedule.

---

## Interactive Sync on Timeline

| Option | Description | Selected |
|--------|-------------|----------|
| Update on Drag/Resize End | Perform drag/resize mutations locally in state for smoothness; save and broadcast only when mouse is released | ✓ |
| Continuous Real-Time Broadcast | Broadcast state updates to peers at every frame of movement | |

**User's choice:** Update on Drag/Resize End: Perform local state changes during the drag for smooth UI, but only broadcast to Yjs when the user releases the mouse (prevents network jitter and collisions).

---

## Automations Builder UI & Loop Prevention

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar Drawer Console + Transaction Origin Tagging | A dedicated "Automations Console" sliding out as a side panel; tag updates with `origin: 'automation'` to block recursive loops | ✓ |
| Full-page builder route + Depth limit | Dedicated route for automations with a count limit on nested rules | |

**User's choice:** Sidebar Drawer Console + Transaction Origin Tagging (Yjs transaction metadata tagging to block recursion).

---

## the agent's Discretion

- The exact layout design of the Gantt timeline bars, SVG grid rendering math, and resize handles.
- The precise Yjs transaction tagging mechanism and data structures for declarative trigger/action rules.
- Color palette variants for the automation rules builder drawer and Gantt grids.

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 03-Gantt Timeline & Automation Builder*
*Discussion log generated: 2026-06-08*
