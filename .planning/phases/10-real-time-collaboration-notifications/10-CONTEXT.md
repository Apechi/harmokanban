# Phase 10: Real-time Collaboration Notifications - Context

**Gathered:** 2026-06-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement interactive real-time collaboration notifications (toasts and history feed) with distinct styling and click actions to alert users about peer events (chat messages when chat is closed, cards added/moved/updated, and projects created/renamed).

</domain>

<decisions>
## Implementation Decisions

### Notification History Persistence
- **D-01:** Persist notifications in IndexedDB per project/room. This ensures notifications are kept across page refreshes and offline sessions, aligning with the project's serverless design.

### Notification Click Actions (Click Behavior)
- **D-02:** Auto-switch project and open card details modal. If the clicked notification is for a card or event in a different project, switch the active project first, then open the details modal for the target card (or navigate appropriately).

### Audio Cues
- **D-03:** Sound alerts enabled by default. Synthesize futuristic sci-fi/tactical chirps/beeps using the browser Web Audio API when new toasts arrive. Include a toggle setting in the Customization Context / Drawer to disable audio cues.

### Header Feed Placement
- **D-04:** Dropdown Popover. Clicking the notification icon in the header opens a floating tactical dropdown overlay displaying scrollable historical notifications.

### the agent's Discretion
- The exact color themes/borders of toasts and notification dropdown lists, as well as the sound synth properties (frequency, duration) of the beeps, are left to the agent's discretion following the monospace tactical identity.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specifications & Roadmap
- [.planning/ROADMAP.md](file:///w:/project/KanbanHarmo/.planning/ROADMAP.md) — Phase 10 goals and success criteria
- [.planning/REQUIREMENTS.md](file:///w:/project/KanbanHarmo/.planning/REQUIREMENTS.md) — NOTIF-01, NOTIF-02, NOTIF-03, and NOTIF-04 requirement definitions

### State & Hooks
- [src/types/index.ts](file:///w:/project/KanbanHarmo/src/types/index.ts) — Data models and types
- [src/hooks/useCollaboration.ts](file:///w:/project/KanbanHarmo/src/hooks/useCollaboration.ts) — Real-time peer awareness and synchronization hooks
- [src/app/page.tsx](file:///w:/project/KanbanHarmo/src/app/page.tsx) — Main dashboard state, event handlers, and layout

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CustomizationContext.tsx`: Can be extended to store and control the state of notification sounds (enabled/disabled).
- `ConfirmModal.tsx`: Example of UI design styling, overlay, and portal structure.

### Established Patterns
- We compare the local state with incoming Yjs state transitions. If incoming updates are remote, we trigger notifications.
- We check `isChatOpen` to decide whether incoming chat messages should trigger a toast alert.

### Integration Points
- Add a Notification Button/Badge to the Header component area in `src/app/page.tsx`.
- Connect WebRTC/Yjs remote updates to notification events triggers in `src/app/page.tsx`.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-Real-time Collaboration Notifications*
*Context gathered: 2026-06-09*
