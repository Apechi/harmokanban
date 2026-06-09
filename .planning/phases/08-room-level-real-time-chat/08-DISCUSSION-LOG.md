# Phase 8: Room-level Real-time Chat - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-09
**Phase:** 08-room-level-real-time-chat
**Areas discussed:** Message History & Performance, Drawer Toggle & Navigation, Unread Indicator & Alert Style, Message Schema & Format

---

## Message History & Performance

| Option | Description | Selected |
|--------|-------------|----------|
| Rolling 100 Messages | Keep last 100 messages in Y.Array, prune older to keep doc size optimal, persist rolling window in IndexedDB | ✓ |
| Infinite History | Keep all chat messages indefinitely in Y.Array | |
| Rolling 200 Messages | Keep last 200 messages in Y.Array, prune older | |

**User's choice:** Rolling 100 Messages
**Notes:** Helps prevent performance degradation in peer synchronization over time.

---

## Drawer Toggle & Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Slide Right & Persist | Slide out from the right side; remain open when switching between Kanban, Gantt, and Analytics views | ✓ |
| Slide Right & Auto-Close | Slide out from the right side; auto-close when switching views | |

**User's choice:** Slide Right & Persist
**Notes:** Keeps the conversation flow continuous while navigating different project views.

---

## Unread Indicator & Alert Style

| Option | Description | Selected |
|--------|-------------|----------|
| Badge + Ping Alert | Increment unread badge on the header button and show a brief tactical flash/ping near the button when closed | ✓ |
| Badge Only | Increment unread badge only (resets on open) with no other alerts | |

**User's choice:** Badge + Ping Alert
**Notes:** Provides a non-intrusive notification of incoming peer communications.

---

## Message Schema & Format

| Option | Description | Selected |
|--------|-------------|----------|
| Plain Text + Links + Logs | Plain text messages with auto-linking for URLs, plus inline system logs in monospace formatting | ✓ |
| Basic Markdown | Basic Markdown support (bold, italic, code blocks) + auto-linking + inline system logs | |

**User's choice:** Plain Text + Links + Logs
**Notes:** Keeps chat interface simple, safe, and aligned with the tactical monospace aesthetic of the application.

---

## the agent's Discretion

- Colors of peer callsigns in the chat log (e.g. mapping to presence colors).
- Precise styling details, paddings, and animations.

## Deferred Ideas

- Card-level comments and thread discussions (out of scope, deferred to Phase 9).

---

*Phase: 08-room-level-real-time-chat*
*Discussion log generated: 2026-06-09*
