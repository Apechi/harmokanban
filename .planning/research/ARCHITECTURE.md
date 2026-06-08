# Architecture Research

**Domain:** Kanban Board Webapp (P2P Real-Time Collaboration)
**Researched:** 2026-06-08
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│  ┌───────────────┐ ┌────────────────┐ ┌──────────────────┐  │
│  │ Kanban Board  │ │  Gantt Chart   │ │ Automations UI   │  │
│  └───────┬───────┘ └───────┬────────┘ └────────┬─────────┘  │
│          │                 │                   │            │
├──────────┼─────────────────┼───────────────────┼────────────┤
│          └─────────────────┼───────────────────┘            │
│                            ▼                                │
│                     State & CRDT Layer                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Yjs Shared Document                  │  │
│  │     (Shared maps: "columns", "cards", "automations")   │  │
│  └─────────────────────────┬─────────────────────────────┘  │
├────────────────────────────┼────────────────────────────────┤
│                            ▼                                │
│                     Persistence & Sync Layer                │
│  ┌─────────────────────────┴─────────┐ ┌──────────────────┐  │
│  │      y-indexeddb Provider         │ │ y-webrtc Provider│  │
│  │  (IndexedDB local persistence)     │ │ (WebRTC Sync)    │  │
│  └───────────────────────────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Presentation Layer | Render Kanban Board, Gantt Chart, and Automation UI; handle user drag/drop and click events | Next.js components styled with Tailwind CSS v4, utilizing `@hello-pangea/dnd` for board drag/drop |
| Yjs Shared Document | Maintain single source of truth for board state, resolving conflicts using CRDT | Yjs `Y.Doc` holding Y.Array / Y.Map data structures |
| y-indexeddb Provider | Local persistence of Yjs doc updates to IndexedDB | `@y-indexeddb` binding directly to the Y.Doc |
| y-webrtc Provider | Network synchronization of Yjs updates between peer browsers using a signaling channel | `@y-webrtc` binding to the Y.Doc and standard signaling servers |

## Recommended Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Main entrypoint containing the Kanban board & Gantt view switcher
│   └── layout.tsx        # Global layout and styles
├── components/           # UI Components
│   ├── Board/            # Kanban Board components
│   │   ├── Column.tsx    # Column component
│   │   └── Card.tsx      # Individual card component
│   ├── Gantt/            # Gantt view components
│   │   └── GanttChart.tsx# Gantt SVG/Canvas rendering and interaction
│   ├── Automations/      # Rules and custom automations UI
│   │   └── RuleBuilder.tsx
│   └── UI/               # Reusable primitive components (buttons, modal, inputs)
├── hooks/                # Custom React Hooks
│   ├── useYDoc.ts        # Initialize Yjs Doc, WebRTC, and IndexedDB providers
│   └── useAutomations.ts # Listen to Yjs board changes and evaluate automation triggers
├── types/                # TypeScript type definitions
│   └── index.ts          # Board, Card, Column, and Automation rule type models
└── utils/                # Helper utilities
    └── time.ts           # Time calculations and timeline mapping
```

### Structure Rationale

- **src/components/**: Separates visual presentation details (Board, Gantt, Rules UI) from state integration.
- **src/hooks/**: Encapsulates all Yjs shared document setup and connection providers, keeping the UI components clean and reactive.

## Architectural Patterns

### Pattern 1: Local-First CRDT (Yjs)

**What:** Load data instantly from IndexedDB local storage and connect WebRTC in the background. Broadcast changes as delta updates.
**When to use:** Crucial for zero-database setups and collaborative tools.
**Trade-offs:** Fast loading and offline capability, but requires metadata overhead for history.

**Example:**
```typescript
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';

export const initSync = (roomName: string) => {
  const ydoc = new Y.Doc();
  const indexdbProvider = new IndexeddbPersistence(roomName, ydoc);
  const webrtcProvider = new WebrtcProvider(roomName, ydoc, {
    signaling: ['wss://signaling.yjs.dev'] // Default signaling fallback
  });
  return { ydoc, indexdbProvider, webrtcProvider };
};
```

### Pattern 2: State Observer Automations

**What:** Register a listener on the Yjs shared map that evaluates registered triggers (e.g. Card moved, Subtask changed) and executes actions.
**When to use:** Implementing client-side automation rules without a backend engine.
**Trade-offs:** Simple to implement, but all connected clients run the listener; requires checks to prevent infinite loops and duplicate triggers.

## Data Flow

### Request Flow

No request goes to a central database server. Data flows peer-to-peer:

```
[User Action: Drag Card]
    ↓
[Board Component] ────updates local state────> [Yjs Shared Doc]
                                                     │
                             ┌───────────────────────┴───────────────────────┐
                             ▼                                               ▼
               [y-indexeddb Provider]                             [y-webrtc Provider]
             (Write update to IndexedDB)                      (Broadcast delta via WebRTC)
                             │                                               │
                             ▼                                               ▼
                      [Local Storage]                                [Connected Peers]
```

### State Management

```
[Yjs Shared Doc (Y.Doc)]
    ↓ (Yjs update events / observers)
[useYDoc Hook React State] → [Components Render]
```

### Key Data Flows

1. **Card update propagation:** A change in Card text or checklist updates the shared Yjs Map, triggering local re-render and broadcasting the update message over WebRTC to other peers in the room.
2. **Automation rule execution:** When a card's subtasks are updated in Yjs, the observers fire, evaluating if the "Auto-move on checklist complete" automation is active, and if so, modifying the card's column ID in Yjs.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-10 users | Standard y-webrtc with public signaling. Excellent speed. |
| 10-100 users | Set up custom private TURN/STUN servers to ensure connection establishment in restrictive networks. |
| 100+ users | Switch from pure P2P mesh network to a hybrid model using a selective forwarding unit (SFU) or y-websocket server to prevent network overload. |

## Anti-Patterns

### Anti-Pattern 1: React State Duplication

**What people do:** Keep a separate React state copy of the board data and sync it manually back and forth with Yjs.
**Why it's wrong:** Leads to out-of-sync states, infinite loops, and duplicate event processing.
**Do this instead:** Bind directly to Yjs observations using a custom hook that maps Yjs maps/arrays to React state reactively on changes.

## Sources

- Yjs Architecture and CRDT Theory — https://yjs.dev
- Local-First Web Development — https://localfirstweb.dev

---
*Architecture research for: Kanban Board Webapp (P2P Real-Time Collaboration)*
*Researched: 2026-06-08*
