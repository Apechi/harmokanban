# Phase 2: P2P Sync & Real-Time Collaboration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 02-P2P Sync & Real-Time Collaboration
**Areas discussed:** Room join & sharing interface, Local state merging strategy, Operator presence & connection indicator UI

---

## Room Join & Sharing Interface

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid Dropdown Panel | Collaborate button in header opens a tactical drawer/dropdown. Shows current Room ID, "Copy Invite Link" (appends ?room=id), a text input to join other rooms, and a random tactical room code generator (e.g., OPERATION-SHADOW-451). Auto-connects if a ?room parameter is in the URL on page load. | ✓ |
| Simple Input Form | A text field directly in the header displaying "Room ID" with a simple Join/Leave button. No sharing link generation or automatic room code generator. | |

**User's choice:** Hybrid Dropdown Panel
**Notes:** Preferred a complete, interactive, and immersive onboarding/sharing interface.

---

## Local State Merging Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-Merge with Overwrite Protection | If the room is new/empty, automatically seed it with the user's current local board state. If the room already has active data from other peers, replace the user's local board state with the room's state so all peers are synchronized, but save a backup of the user's local board offline beforehand so no data is permanently lost. | ✓ |
| Isolated Room State | Treat the local offline board and collaborative rooms as completely distinct. Joining a room loads a clean board specific to that room (stored in Yjs). Leaving the room restores the user's offline board. The offline board never mixes with collaborative room data. | |
| Merge Prompt | Ask the user explicitly on joining: 'Do you want to merge your current board into the room, or replace your board with the room's content?' | |

**User's choice:** Auto-Merge with Overwrite Protection
**Notes:** Automatically seeding empty rooms and restoring/backing up local state provides the best user experience.

---

## Operator Presence & Connection Indicator UI

| Option | Description | Selected |
|--------|-------------|----------|
| Arknights-style Tactical Squad Presence | Display a neon connection status indicator (Green/Cyan for online with peer count, Red for offline). Include a "Squad List" in the header showing active operators. Each peer gets a random Arknights operator callsign (e.g., Doctor, Amiya, Texas, Exusiai, or Operator-XXX) stored in Yjs awareness, which they can customize in the collaboration drawer. Show visual indicators when an operator is actively viewing/editing a card. | ✓ |
| Simple Status Badge | Just show a clean status text and connection count in the header (e.g., "COLLABORATION: ACTIVE [3 PEERS]"). No user nicknames, operator callsigns, or card edit indicators. | |

**User's choice:** Arknights-style Tactical Squad Presence
**Notes:** Enhances the premium tacticool theme of the application.

---

## the agent's Discretion

- Choice of default public signaling servers for y-webrtc.
- STUN/TURN backup configuration if default public WebRTC iceServers are insufficient.
- Visual positioning and components layout inside the Collaborate dropdown/drawer.

## Deferred Ideas

None.
