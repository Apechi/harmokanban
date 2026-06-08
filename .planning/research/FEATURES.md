# Feature Research

**Domain:** Kanban Board Webapp (P2P Real-Time Collaboration)
**Researched:** 2026-06-08
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Kanban Board view | Core view for task tracking and drag-and-drop movement between columns | MEDIUM | Needs smooth, accessible drag-and-drop using @hello-pangea/dnd |
| Columns management | Add, edit, delete, and reorder columns (e.g., Todo, In Progress, Done) | LOW | Simple list state management |
| Card creation & details | Title, description, due date, priority levels (Low, Medium, High), and tags | LOW | Basic model forms and modal view |
| Subtask Checklist | Break down tasks into subtasks with checklist progress indicator/bar | LOW | Embedded subtask array within the card structure |
| Local persistence | Data must persist when reloading the page | LOW | y-indexeddb or localStorage integration |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| P2P Real-Time Sync | Collaboration without a central database, ensuring fast updates and high privacy | HIGH | Yjs + y-webrtc integration |
| Interactive Gantt Chart | Visual planning of task durations and dependencies via resizable/draggable timeline bars | HIGH | SVG or Canvas timeline rendering with custom mouse/touch event handling |
| Automations Builder | Simple UI to configure 'Trigger -> Action' rules (e.g., auto-move on checklist complete) | MEDIUM | State listeners that evaluate triggers and apply modifications |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full WebSockets Server | Centralized collaborative server | High server costs, setup complexity, database sync maintenance | y-webrtc with lightweight signaling peers |
| Complex custom database integration | Enterprise authentication and cloud DB support | Slows down initial validation, increases infrastructure requirements | local-first client-side IndexedDB persistence + WebRTC sync |

## Feature Dependencies

```
[Real-Time Sync]
    └──requires──> [Local persistence / IndexedDB]
                       └──requires──> [Kanban Board view]

[Interactive Gantt Chart] ──enhances──> [Card due dates / start dates]

[Automations Builder] ──mutates──> [Kanban Board view / Card properties]
```

### Dependency Notes

- **Real-Time Sync requires Local persistence**: Synchronized CRDT documents need local storage mapping (y-indexeddb) to load instantly offline before connecting to peers.
- **Interactive Gantt Chart enhances Card due dates**: The timeline visually changes start and due dates by resizing or dragging task bars.
- **Automations Builder mutates Kanban Board view**: Rules automatically change card columns or fields when events (like checklist completion) trigger.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Core Kanban Board — Drag-and-drop cards and customizable columns.
- [ ] Card Details — Title, description, due dates, priority levels, subtask checklists, and custom tags.
- [ ] Local Offline Sync — IndexedDB local state persistence.
- [ ] P2P Collaboration — Real-time synchronization over WebRTC using Yjs.
- [ ] Interactive Gantt Chart — Visual timeline with resizable and draggable task duration bars.
- [ ] Automation Rules — Auto-move card on checklist completion, auto-priority updates, and a basic trigger/action builder.

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] File attachments — P2P file sharing or local browser storage allocation.
- [ ] Advanced Filters & Search — Custom board querying.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Burn-down charts and velocity analytics dashboards.
- [ ] Centralized cloud authentication (Google/GitHub OAuth) & Postgres database backend.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Kanban Board view | HIGH | MEDIUM | P1 |
| Card details & subtasks | HIGH | LOW | P1 |
| Local IndexedDB storage | HIGH | LOW | P1 |
| Yjs P2P WebRTC sync | HIGH | HIGH | P1 |
| Interactive Gantt view | HIGH | HIGH | P1 |
| Automations engine/UI | MEDIUM | MEDIUM | P1 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A (Trello) | Competitor B (Linear) | Our Approach |
|---------|-----------------------|-----------------------|--------------|
| Collaboration | Centralized database sync | Highly optimized server-client sync | Serverless P2P CRDT sync via Yjs/WebRTC |
| Gantt Timeline | Premium add-on / paid plan | Paid subscription only | Free, fully local-first interactive Gantt view |
| Automations | Butler bots (cloud execution) | Custom webhooks / manual rules | Built-in client-side trigger-action engine |

## Sources

- Yjs features and performance — https://yjs.dev
- Trello power-ups research — https://trello.com
- Linear product design documentation — https://linear.app

---
*Feature research for: Kanban Board Webapp (P2P Real-Time Collaboration)*
*Researched: 2026-06-08*
