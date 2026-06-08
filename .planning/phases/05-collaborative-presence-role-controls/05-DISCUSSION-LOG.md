# Phase 5: Collaborative Presence & Role Controls - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 5-Collaborative Presence & Role Controls
**Areas discussed:** Cursor Tracking & Rendering, Viewer Permissions UX, Multi-User Card Activity Display, Role Selection Location

---

## Cursor Tracking & Rendering

| Option | Description | Selected |
|--------|-------------|----------|
| Moderate throttling (50-100ms) with smooth CSS transitions | Balance CPU/network performance and animation fluidity | ✓ |
| High frequency (no throttling) | Real-time cursor movement | |
| Low frequency (250ms+) | Minimize WebRTC/network overhead | |

**User's choice:** Moderate throttling (50-100ms) with smooth CSS transitions to balance CPU/network performance and fluidity.

---

## Viewer Permissions UX

| Option | Description | Selected |
|--------|-------------|----------|
| Enforce read-only UI | Hide/disable edit inputs, disable drag-and-drop handles, read-only modals | ✓ |
| Permissive UI | Keep buttons visible but show warning toasts on edits | |

**User's choice:** Enforce read-only UI: Hide or disable edit buttons, disable drag-and-drop handles, and display cards in a read-only modal state.

---

## Multi-User Card Activity Display

| Option | Description | Selected |
|--------|-------------|----------|
| Render small avatar badges/initials on board, show active users in Card Modal | Display avatar indicators at the top-right corner of cards, and inside the modal | ✓ |
| Only show inside Card Modal | No indicator on the main board | |
| Add colored borders around cards | Show borders around viewed cards on the board | |

**User's choice:** Render small avatar badges/initials at the top-right corner of cards on the board, and show active users inside the Card Modal.

---

## Role Selection Location

| Option | Description | Selected |
|--------|-------------|----------|
| Inside Collaborate Drawer | Position selector within the room connection UI | ✓ |
| Global settings gear menu | Position selector in the global header/sidebar | |

**User's choice:** Inside the Collaborate Drawer where users input the Room ID to connect.

---

## the agent's Discretion
- Custom styling details for cursor pointer colors and username tags.
- Precise transition timing curves/durations for cursor animations.
- Exact layout and presentation of active users inside the Card Modal.

## Deferred Ideas
- None — discussion stayed within phase scope.

---

*Phase: 05-collaborative-presence-role-controls*
*Discussion log generated: 2026-06-08*
