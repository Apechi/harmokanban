# Tech Stack Additions Research

## Recommended Stack Additions

For the new features in Milestone 2.0 (Project List, Cursor Tracking, Active Card Indicators, Date & Time fields, and Role-based Collaboration), we recommend utilizing the following stack additions/extensions.

| Library / API | Purpose | Why Recommended |
|---|---|---|
| Yjs Awareness Protocol | Ephemeral real-time states (Cursors, Active users, Viewer roles) | Built-in protocol of Yjs, handled natively by `y-webrtc`. Lightweight, zero-overhead client-side propagation. |
| React-Icons / Lucide-React | Icon indicators (cursors, projects, roles) | Already installed, rich SVG collection. |
| Date & Time Picker component | Intuitive time assignment in Kanban card details | We can extend our date inputs to native `<input type="datetime-local" />` styled with Tailwind CSS to support time. |

## What NOT to Add
- **Database/Backend Auth Service**: Defer centralized databases to preserve the serverless, database-less P2P design constraints. Use localStorage/IndexedDB for project lists and cryptographic client-side role settings if needed, or simple awareness-based peer roles.
- **Heavy Canvas rendering libraries**: Cursor rendering can be achieved with simple CSS/Tailwind absolute elements overlaying the viewport, throttled to keep performance high.
