<!-- GSD:project-start source:PROJECT.md -->

## Project

**KanbanHarmo**

An intuitive and advanced Kanban web application designed specifically for startup project planning. It helps startup teams collaborate seamlessly using peer-to-peer (P2P) real-time synchronization, manage tasks, and visualize project timelines.

**Core Value:** Enable rapid, frictionless startup project planning with a highly interactive, collaborative client-side board and Gantt visualization.

### Constraints

- **Tech Stack**: Next.js (React), Tailwind CSS v4, Yjs/WebRTC — startup's chosen tech stack.
- **Data Persistence**: Client-side storage (localStorage / IndexedDB) and WebRTC signaling fallback — constraint of the database-less P2P design.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js (App Router) | ^15.0.0 | Full-stack React framework | Industry standard for modern React applications; App Router provides excellent routing and page optimization |
| Tailwind CSS | ^4.0.0 | Styling framework | Utility-first CSS framework (latest version) providing modern styling capabilities, CSS variables support, and performant utility classes |
| Yjs | ^13.6.0 | Conflict-free Replicated Data Types (CRDTs) | Extremely fast and robust CRDT implementation for collaborative editing of board state |
| y-webrtc | ^10.3.0 | WebRTC connection provider | Connects Yjs peers directly over WebRTC for true serverless client-to-client collaborative sync |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hello-pangea/dnd | ^18.0.0 | Drag and drop interactions | Actively maintained fork of react-beautiful-dnd, perfect for lists and board drag-and-drop mechanics |
| IndexedDB (idb) | ^8.0.0 | Client-side database | Persistent offline storage of local board states, synced automatically with Yjs |
| y-indexeddb | ^9.0.0 | Yjs IndexedDB provider | Offline persistence for Yjs documents so data is saved locally across browser reloads |
| lucide-react | ^0.450.0 | Icon library | Clean, lightweight SVG icon components |
| framer-motion | ^11.11.0 | Micro-animations | Smooth transitions, card movement effects, and rule builder panel animations |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript | Type safety | Standard configuration for Next.js |
| ESLint / Prettier | Linting & code formatting | Code quality enforcement |

## Installation

# Core

# Supporting

# Dev dependencies

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| y-webrtc | y-websocket | If clients have restricted NAT environments that prevent direct WebRTC connections, requiring a lightweight centralized signaling server. |
| @hello-pangea/dnd | dnd-kit | If a highly customizable, multi-sensor grid layout drag-and-drop system is preferred over standard vertical lists. |
| Yjs | Automerge | Automerge is another excellent CRDT, but Yjs has a larger ecosystem of bindings (like y-webrtc and y-indexeddb) and faster performance on large documents. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-beautiful-dnd | Outdated, deprecated, lacks React 18/19 support | @hello-pangea/dnd |
| Socket.io (custom server) | Introduces high backend maintenance cost and complexity | y-webrtc with signaling fallback |

## Stack Patterns by Variant

- Use a public/shared signaling server or STUN/TURN server
- Because WebRTC connection negotiation (ICE) requires a signaling channel and fallback relays (TURN) for symmetric NATs.
- Perform state snapshots periodically and prune document update history
- Because Yjs CRDTs keep track of all historic updates, which can grow over time.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@15.x | react@19.x / react-dom@19.x | Standard Next.js v15 setup |
| @hello-pangea/dnd | react@18/19 | Check peer dependency warnings during install |

## Sources

- Yjs Official Documentation — https://docs.yjs.dev
- Hello Pangea GitHub Repo — https://github.com/hello-pangea/dnd
- Next.js Documentation — https://nextjs.org/docs

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
