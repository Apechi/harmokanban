# Phase 8: Room-level Real-time Chat - Context

**Gathered:** 2026-06-09
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase implements a slide-out room chat drawer allowing real-time workspace-wide peer messaging when connected to a collaborative room.

</domain>

<decisions>
## Implementation Decisions

### Message History & Performance
- **D-01:** Synchronize chat messages in real-time using a Yjs shared Array (`Y.Array`) on the room document.
- **D-02:** Limit the shared array to a rolling window of the last 100 messages. When a new message is sent and the array size exceeds 100, the oldest message(s) are removed from the shared array to keep the Yjs document size optimal.
- **D-03:** Store messages locally using the existing `y-indexeddb` persistence provider, which automatically saves the Yjs room document (including the chat array) to IndexedDB.

### Drawer Toggle & Navigation
- **D-04:** The Chat Drawer slides out from the right side of the screen.
- **D-05:** The Chat Drawer remains open even when the user switches between different views (Kanban, Gantt, and Analytics) to ensure the conversation can be followed uninterrupted.

### Unread Indicator & Alert Style
- **D-06:** Keep an unread messages counter that badges the chat drawer toggle button in the header when the drawer is closed. The counter resets to 0 immediately upon opening the drawer.
- **D-07:** Show a brief, non-intrusive tactical/minimalist flash/ping near the header button when a new message arrives and the drawer is closed.

### Message Schema & Format
- **D-08:** Messages are stored and displayed as plain text, with automatic link detection and clickable URLs.
- **D-09:** Render system events (e.g., when a user joins or leaves the room) inline within the chat stream formatted as tactical system logs.
- **D-10:** Message structure:
  ```typescript
  interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: number;
    isSystem?: boolean;
  }
  ```

### the agent's Discretion
- Spacing, padding, and exact typography of the chat drawer.
- Colors of peer callsigns in the chat list (can map to presence colors).
- Exact animation parameters for the slide-out transition.

</decisions>

<specifics>
## Specific Ideas

- Monospace layout is standard for system readouts and status messages to match the tactical UI theme.
- Minimalist beep/flash effects for unread indicators should match the existing tactical dashboard style.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- [.planning/REQUIREMENTS.md](file:///.planning/REQUIREMENTS.md) — Requirements CHAT-01, CHAT-02, and CHAT-05.
- [.planning/ROADMAP.md](file:///.planning/ROADMAP.md) — Defines Phase 8 goals.

### Sync & Collaboration
- [src/hooks/useCollaboration.ts](file:///src/hooks/useCollaboration.ts) — Current collaboration hook maintaining Yjs, WebRTC, and presence states.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useCollaboration.ts`: Manages Yjs room context, local presence callsign, user ID, and active room connection state.
- Existing custom scrollbar classes and tactical CSS styling context.

### Established Patterns
- Monospace styling is heavily used for dashboards, presence cursor badges, and console readouts.
- Responsive slide-out drawers or panels (similar to the settings drawer).

### Integration Points
- Top navigation bar (where the room connection input and peer counts are displayed) to add the Chat Drawer toggle button.
- React/Next.js root page layout to mount the slide-out drawer.

</code_context>

<deferred>
## Deferred Ideas

- Card-level comments and thread discussions — Out of scope, deferred to Phase 9.
- Persistent database-backed chat histories or search functionality — Out of scope.

</deferred>

---

*Phase: 08-room-level-real-time-chat*
*Context gathered: 2026-06-09*
