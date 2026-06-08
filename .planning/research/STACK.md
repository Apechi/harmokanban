# Stack Research

**Domain:** Kanban Board Webapp (P2P Real-Time Collaboration)
**Researched:** 2026-06-08
**Confidence:** HIGH

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

```bash
# Core
npm install yjs y-webrtc next@latest react@latest react-dom@latest

# Supporting
npm install @hello-pangea/dnd idb y-indexeddb lucide-react framer-motion

# Dev dependencies
npm install -D tailwindcss@next @tailwindcss/postcss@next postcss typescript @types/node @types/react @types/react-dom
```

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

**If NAT traversal fails:**
- Use a public/shared signaling server or STUN/TURN server
- Because WebRTC connection negotiation (ICE) requires a signaling channel and fallback relays (TURN) for symmetric NATs.

**If Yjs sync gets bloated:**
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

---
*Stack research for: Kanban Board Webapp (P2P Real-Time Collaboration)*
*Researched: 2026-06-08*
