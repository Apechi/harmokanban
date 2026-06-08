# Project Research Summary

**Project:** KanbanHarmo
**Domain:** Kanban Board Webapp (P2P Real-Time Collaboration)
**Researched:** 2026-06-08
**Confidence:** HIGH

## Executive Summary

KanbanHarmo is a local-first, peer-to-peer (P2P) collaborative Kanban board and Gantt chart web application optimized for startup project planning. The application allows users to organize tasks, customize boards, configure client-side automation rules, and plan timelines, all while maintaining real-time collaboration with team members directly from their browsers.

To achieve collaboration without the cost, complexity, and privacy concerns of a central database backend, the system leverages Yjs (a high-performance CRDT framework) combined with WebRTC (`y-webrtc`) for serverless peer sync. Local persistence is achieved using IndexedDB (`y-indexeddb`), ensuring immediate page loads and offline resilience.

Key risks include NAT traversal limitations for P2P networks (mitigated using robust STUN/TURN configurations) and potential infinite loops in client-side automation rules (mitigated by assigning update transaction origins to filter out recursive triggers).

## Key Findings

### Recommended Stack

The stack relies on Next.js 15 for the structure and Tailwind CSS v4 for premium aesthetics. Collaborative state is handled by Yjs and sync by y-webrtc.

**Core technologies:**
- **Next.js 15 (App Router):** Frame structures and routing.
- **Tailwind CSS v4:** Premium responsive CSS design.
- **Yjs:** Conflict-free shared state management.
- **y-webrtc:** Serverless client-to-client updates.
- **y-indexeddb:** Immediate local persistence.

### Expected Features

**Must have (table stakes):**
- Drag-and-drop Kanban Board with customizable columns.
- Card details with checklists, priorities, due dates, custom tags, and custom fields.
- Local-first IndexedDB persistence.
- Peer-to-peer real-time board sync.

**Should have (competitive):**
- Interactive Gantt chart with resizable and draggable task timelines.
- Client-side automation rule engine (e.g., auto-move on checklist complete).
- Declarative Trigger -> Action custom rule builder.

### Architecture Approach

A local-first architecture where the Yjs document represents the single source of truth.

**Major components:**
1. **Presentation Layer:** Next.js + Tailwind v4 + @hello-pangea/dnd board.
2. **State & CRDT Layer:** Yjs shared document containing board maps.
3. **Persistence & Sync Layer:** y-indexeddb and y-webrtc providers.

### Critical Pitfalls

1. **WebRTC NAT Traversal Failures:** Mitigated by specifying public STUN/TURN servers.
2. **Infinite Automation Loops:** Mitigated by marking automation-triggered transaction origins in Yjs and ignoring them in rules evaluation.
3. **Yjs History Bloat:** Mitigated by batching and debouncing state updates.

## Implications for Roadmap

Suggested phase structure:

### Phase 1: Core Board & Local Persistence
**Rationale:** Establishing the core user flows and local database stability before adding network sync.
**Delivers:** Kanban board with full drag-and-drop, card editing details, checklists, tags, custom fields, and IndexedDB local persistence.
**Avoids:** Early network sync conflicts.

### Phase 2: P2P Sync & Real-Time Collaboration
**Rationale:** Integrating real-time collaboration on top of a stable board state.
**Delivers:** WebRTC integration using Yjs, showing peer connection status, and instant multi-tab sync.
**Avoids:** WebRTC NAT traversal failures.

### Phase 3: Gantt Timeline & Automation Builder
**Rationale:** Adding advanced planning tools and client-side automation logic once the foundation is fully collaborative.
**Delivers:** Resizable/draggable Gantt chart, rule engine, and Rule Builder UI.
**Avoids:** Infinite loops.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Yjs and Next.js are highly standard |
| Features | HIGH | Scopes are well-aligned with startup planning needs |
| Architecture | HIGH | Local-first architecture is well-suited for high privacy/offline tools |
| Pitfalls | HIGH | Clear mitigation strategies for loop prevention and NAT traversal |

**Overall confidence:** HIGH

### Gaps to Address

- **WebRTC relay fallback:** Needs configuration of open STUN/TURN servers.
- **Next.js SSR vs. Yjs local-first hydration:** Next.js server-side rendering must safely handle client-only IndexedDB and WebRTC bindings (using dynamic imports or hydration checks).

## Sources

- Yjs Documentation — https://docs.yjs.dev
- WebRTC specifications — https://webrtc.org

---
*Research completed: 2026-06-08*
*Ready for roadmap: yes*
