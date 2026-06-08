# Pitfalls Research

**Domain:** Kanban Board Webapp (P2P Real-Time Collaboration)
**Researched:** 2026-06-08
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: WebRTC NAT Traversal Failures

**What goes wrong:**
Peers in different networks (especially behind corporate firewalls or symmetric NATs) cannot establish a direct P2P connection, preventing them from syncing.

**Why it happens:**
WebRTC requires STUN/TURN servers to discover public IPs and relay traffic when direct P2P connection is impossible. Without a proper TURN server fallback, traversal fails.

**How to avoid:**
Configure the `y-webrtc` provider to use reliable public STUN servers (like Google STUN) and specify a TURN server fallback in production.

**Warning signs:**
Signaling connection completes, but the peer count remains 0/1 and no updates are synced.

**Phase to address:**
Phase 2 (Real-Time Sync integration)

---

### Pitfall 2: Infinite Automation Loops

**What goes wrong:**
An automation rule triggers an update that fires another rule (or re-fires the same rule), causing the browser to lock up or crash due to an infinite execution loop.

**Why it happens:**
Trigger handlers mutating the Yjs doc do not differentiate between user-initiated updates and automation-initiated updates, creating a feedback cycle.

**How to avoid:**
Add metadata or temporary transaction origins (`transaction.origin`) to Yjs updates initiated by the automation engine. The automation observer should ignore updates originating from "automation".

**Warning signs:**
Max call stack exceeded errors in console; browser tab freezes when checking a checklist box.

**Phase to address:**
Phase 3 (Gantt and Automations)

---

### Pitfall 3: Yjs History Bloat

**What goes wrong:**
As users perform thousands of actions (drag/drops, keystrokes, checkboxes), the internal CRDT history of the document grows continuously, leading to slow page load and high memory usage.

**Why it happens:**
Yjs retains transaction history to handle offline edits and sync. In local storage (IndexedDB), this grows unbounded.

**How to avoid:**
Structure the state schema logically and use debounce for text input updates so that each keystroke doesn't write a separate Yjs transaction.

**Warning signs:**
IndexedDB size exceeds tens of megabytes for simple boards; sync takes several seconds upon opening the app.

**Phase to address:**
Phase 2 (Real-Time Sync integration)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using public signaling servers | Zero infrastructure setup | Unreliable availability, potential privacy concerns | During MVP/local development only |
| No TURN server configuration | Easy WebRTC config | 15-20% of users fail to connect | Local/same-network testing only |
| Storing raw React states in Yjs | Fast prototype | Concurrent edit conflicts overwrite entire board fields | Never; must use Yjs native types (Y.Map, Y.Array) |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Yjs with React rendering | Re-creating the Yjs Doc on every React state render | Instantiating the Y.Doc outside the React component tree or within a persistent `useRef` hook |
| `@hello-pangea/dnd` in React | Not wrapping list updates in single transactional operations | Perform state modifications inside a `doc.transact(() => { ... })` wrapper to avoid half-applied updates |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Live DOM updates on drag | Choppy dragging motion, laggy animation | Use CSS transitions and optimize React list rendering using memoization (`React.memo`) | Over 50 cards on board |
| Large Yjs document sync | White screen / loading spinner for several seconds | Load local IndexedDB state synchronously first, then start WebRTC connection asynchronously | Over 500 tasks in history |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Cleartext signaling room names | Random users can guess the room name and join the board | Generate cryptographically secure random Room IDs (UUIDv4) and include a secret key hash |
| Execution of arbitrary code in Automations | Custom user script rules compromise browser security | Restrict Automations to a fixed set of declarative Rules (Trigger -> Action) — do not support eval/JS input |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Conflicting drag-and-drop actions | Two users drag the same card simultaneously, causing card to jump or disappear | Use visual lock indicators or immediately apply CRDT consensus resolution with smooth translation animations |
| Lack of offline indicator | User makes changes thinking they are online, but connection failed | Add a clear network status indicator (Connected/Offline/Syncing) in the header |

## "Looks Done But Isn't" Checklist

- [ ] **Real-Time Sync:** Works between tabs, but fails across different networks — verify with mobile data/NAT traversal.
- [ ] **Gantt Chart:** Renders bars, but dragging them doesn't update due dates — verify card state matches timeline coordinates.
- [ ] **Automations Builder:** Move card rule works, but causes duplicate runs — verify loop prevention.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Sync lock/freeze | LOW | Clear room IndexedDB storage or change Room Name to create a fresh board |
| Connection failure | LOW | Toggle network status, verify signaling server status, check STUN config |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| WebRTC NAT Traversal Failures | Phase 2 | Test connection across cellular data and home network |
| Infinite Automation Loops | Phase 3 | Run automated loop checks and manual test of overlapping rules |
| Yjs History Bloat | Phase 2 | Verify IndexedDB memory footprint after 100 drag-and-drop operations |

## Sources

- WebRTC Security & Traversal — https://webrtc-security.github.io
- Yjs community discussion on transaction origin — https://discuss.yjs.dev

---
*Pitfalls research for: Kanban Board Webapp (P2P Real-Time Collaboration)*
*Researched: 2026-06-08*
