# Pitfalls & Mitigations

Common mistakes to avoid when implementing WebRTC cursor tracking and role-based views.

## Identified Pitfalls

### 1. Awareness Jitter & Overhead
- **Problem**: Broadcaster flooding the WebRTC network with cursor events on every single pixel movement.
- **Mitigation**: Throttle mouse events to 60-80ms. Use CSS transitions on the cursor elements to smooth out the movement.

### 2. Relative Cursor Scaling
- **Problem**: If users have different window sizes/resolutions, cursor absolute coordinate coordinates (clientX, clientY) will map to different UI places on another screen.
- **Mitigation**: Track positions relative to the workspace container element (e.g. `cursorX = (mouseX - rect.left) / rect.width`).

### 3. "Ghost" Users & Awareness Leaks
- **Problem**: Peer list grows with stale sessions if users close tabs or go offline abruptly.
- **Mitigation**: The `y-webrtc` awareness protocol handles timeout cleanups, but our React state listeners must correctly clean up listeners on component unmount to prevent leaks.

### 4. Bypassable Viewer Controls
- **Problem**: In database-less environments, a viewer can edit their local state and trigger sync.
- **Mitigation**: In a database-less peer environment, absolute security is not possible since the clients communicate directly. Client-side blocking is sufficient for collaboration, but we should make sure local automation engines do not execute writes if the client is marked as a Viewer.
