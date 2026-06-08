# Research Summary: Collaboration & Project Scoping

Key architectural findings for Milestone v2.0:

## Stack Additions
- **Yjs Awareness Protocol**: Utilized for real-time cursor updates, viewer role signaling, and card focus presence.
- **Tailwind Transitions**: To smooth cursor movements.
- **datetime-local**: For task time specification.

## Core Features
1. **Multi-Project Scoping**: Nest board states inside a `projects` Map in the Yjs document.
2. **Smooth Cursor Tracking**: Throttle state updates and render absolute coordinates scaled to container widths.
3. **Active Card Views**: Synchronize `viewingCardId` inside awareness state to render avatar lists on cards.
4. **Roles**: Simple peer roles (Viewer, Editor) to enforce UI-level write blockages.

## Watch Out For
- **Network Flooding**: Throttle mouse events to keep WebRTC channel latency low.
- **Resolution Mismatch**: Use relative container scaling (0 to 1 coordinates) for cursors.
