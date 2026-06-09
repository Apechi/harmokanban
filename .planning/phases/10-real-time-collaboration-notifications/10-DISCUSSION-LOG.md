# Phase 10: Real-time Collaboration Notifications - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-09
**Phase:** 10-Real-time Collaboration Notifications
**Areas discussed:** Notification History Persistence, Notification Click Actions, Audio Cues, Header Feed Placement

---

## Notification History Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| IndexedDB persistence | Saved to IndexedDB per project/room so they persist across page refreshes | ✓ |
| In-memory only | Kept in React state only and reset when page reloads | |

**User's choice:** IndexedDB persistence
**Notes:** Persisting notifications aligns with the client-side serverless strategy of KanbanHarmo.

---

## Notification Click Actions

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-switch project and open card details modal | If clicked notification is for a different project, switch project first and open card modal | ✓ |
| Switch project only | Change active project to target project but do not open card modal | |
| Only open details if already in active project | Ignore clicks or warn the user if they belong to another project | |

**User's choice:** Auto-switch project and open card details modal
**Notes:** Provides a seamless user experience when working across multiple projects.

---

## Audio Cues

| Option | Description | Selected |
|--------|-------------|----------|
| Silent by default, but customizable | Include browser Web Audio API synthesized sounds, disabled by default, customizable in settings | |
| Silent only | Purely visual toasts and feed items, no audio capabilities | |
| Enabled by default | Synthesize sci-fi alert/chirp sounds when new toasts arrive, with a toggle to disable them | ✓ |

**User's choice:** Enabled by default
**Notes:** Reinforces the tactical/sci-fi visual and acoustic theme immediately.

---

## Header Feed Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Dropdown Popover | Clicking the notification icon in the header opens a floating tactical dropdown overlay | ✓ |
| Slide-out Drawer | Opens a side panel on the right, matching the Chat Drawer structure | |

**User's choice:** Dropdown Popover
**Notes:** Kept lightweight in the header layout, preserving the right side of the board for specific drawer interactions.

---

## the agent's Discretion

- Visual styling of toasts and dropdown list items.
- Specific pitch and timing configuration of synthesized Web Audio API sounds.

## Deferred Ideas

None — discussion stayed within phase scope.
