# Phase 4: Multi-Project & Time Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 4-Multi-Project & Time Management
**Areas discussed:** Project Sync & Storage Model, Project Switcher & Management UI Layout, Date-Time Input UX & Format

---

## Project Sync & Storage Model

| Option | Description | Selected |
|--------|-------------|----------|
| Separate Yjs rooms/docs (Recommended) | Partition each project into its own room/doc for isolation and speed. | ✓ |
| Single room with project keys | Sync all projects under one room, partitioned by keys. | |
| You decide | Let the agent choose the best architectural approach. | |

**User's choice:** Separate Yjs rooms/docs (Recommended)
**Notes:** Project ID/code acts as the room name for P2P sync. A default local project is auto-generated on startup.

---

## Project Switcher & Management UI Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Left Sidebar (Recommended) | Collapsible tactical sidebar on the left with project listing, switcher, and CRUD controls. | ✓ |
| Header Dropdown | Compact dropdown selector in the top banner next to the application logo, with management modal. | |
| You decide | Let the agent choose the best placement. | |

**User's choice:** Left Sidebar (Recommended)

---

## Project Deletion Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Cascade Delete (Recommended) | Deleting a project permanently deletes all its columns, cards, and data. | |
| Archive Project | Hide the project from the switcher list but keep the data in IndexedDB for potential recovery. | ✓ |
| You decide | Let the agent choose the deletion behavior. | |

**User's choice:** Archive Project

---

## Date-Time Input UX

| Option | Description | Selected |
|--------|-------------|----------|
| Combined datetime-local input (Recommended) | A single unified browser input for date and time. | ✓ |
| Separate Date and Time pickers | Distinct input controls for date and time fields. | |
| You decide | Let the agent choose the input style. | |

**User's choice:** Combined datetime-local input (Recommended)

---

## Time Display Format

| Option | Description | Selected |
|--------|-------------|----------|
| Tactical 24-Hour Clock (Recommended) | Show time in 24-hour military format (e.g., '14:30', '09:15'), fitting the tactical theme. | ✓ |
| Standard 12-Hour Clock | Show time with AM/PM (e.g., '2:30 PM', '9:15 AM'). | |
| You decide | Let the agent choose the time format. | |

**User's choice:** Tactical 24-Hour Clock (Recommended)

---

## the agent's Discretion
- Visual theme and badges for projects in Left Sidebar.
- Schema/storage design under the hood in IndexedDB.

## Deferred Ideas
- None — discussion stayed within phase scope
