# Integration & Architecture Research

How the new features fit into the existing client-side, database-less Yjs/WebRTC architecture.

## Integration Points

### 1. Document Schema Evolution
Currently, the root Yjs Map (`yRootMap`) directly stores the Kanban board's single state:
- `columnOrder` -> `Y.Array<string>`
- `columns` -> `Y.Map<Y.Map>`
- `cards` -> `Y.Map<Y.Map>`

To support multiple projects:
- `projects` -> `Y.Map<Y.Map>` (where each project map contains its own `id`, `name`, `columns`, `cards`, `columnOrder`).
- Switcher logic selects the active project ID and subscribes the UI state to that specific sub-tree of the Yjs document.

### 2. Awareness Sync (Cursors & Presence)
`WebrtcProvider.awareness` broadcasts client-specific ephemeral states:
- `localStateField('user')` contains `{ name: string, color: string }`.
- We will expand it to:
  ```json
  {
    "user": { "name": "Doctor-104", "color": "#E11D48" },
    "cursor": { "x": 0.45, "y": 0.32 },
    "viewingCardId": "card-xyz",
    "role": "editor"
  }
  ```

### 3. Date & Time Formats
Task interface updates from `string | null` (due dates) to include time.
- Standard ISO datetime strings: `YYYY-MM-DDTHH:mm:ss.sssZ` handles dates + times consistently.

### 4. Client-side Role Enforcement
- Active users select their role or receive a default role on join.
- When `role === 'viewer'`, UI restricts:
  - Drag-and-drop handles.
  - Adding columns, checklists, and cards.
  - Automations execution (viewers should not run local triggers that modify the shared doc).
