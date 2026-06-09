---
phase: 07-theme-switcher-styling-customization
reviewed: 2026-06-09T07:20:59Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/components/AnalyticsDashboard.tsx
  - src/components/CustomizationContext.tsx
  - src/components/CustomizationDrawer.tsx
findings:
  critical: 0
  warning: 2
  info: 1
  total: 3
status: resolved
---

# Phase 07: Code Review Report

**Reviewed:** 2026-06-09T07:20:59Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** resolved

## Summary

A standard-depth code review was performed on the 6 files modified during Phase 7 (Theme Switcher & Styling Customization). The visual customizations, theme settings drawer, and light/dark theme variables are well-structured and integrate smoothly with the existing system. No critical bugs or security blockers were found. However, two warnings regarding CSS inline style injection and chart tooltip offset positioning, along with one minor UX improvement for state synchronization, have been identified.

## Warnings

### [FIXED] WR-01: CSS Injection via Custom Background Image URL

**File:** `src/app/page.tsx:618`
**Issue:** The custom background image URL is inserted directly into the inline style `backgroundImage: url("${bgImage}")` without sanitization or quote escaping. A user could input a URL containing double quotes to break out of the CSS `url()` wrapper and inject custom CSS rules or trigger requests.
**Fix:**
Strip any double quotes or backslashes from the background image URL before setting the inline style, or sanitize it using a helper function:
```tsx
const sanitizeBgUrl = (url: string) => {
  if (url === "none") return "none";
  // Strip quotes and potential injection characters
  const cleanUrl = url.replace(/["'\\]/g, "");
  return `url("${cleanUrl}")`;
};

// In src/app/page.tsx:
style={{ 
  backgroundImage: sanitizeBgUrl(bgImage),
  opacity: bgOpacity / 100
}}
```

### [FIXED] WR-02: Tooltip Position Offset Bug due to Relative Parent Container

**File:** `src/components/AnalyticsDashboard.tsx:496`
**Issue:** The absolute position coordinates of chart tooltips are calculated using viewport-relative coordinates (`rect.left`, `rect.top`) combined with page scroll offsets (`window.scrollX`, `window.scrollY`). However, the tooltip element is rendered inside the dashboard main container which has `position: relative`. This causes the tooltip to be positioned incorrectly (offset by the dashboard container's position).
**Fix:**
Calculate the tooltip position relative to the dashboard container itself, or render the tooltip in a React Portal at the body level so that document absolute positioning coordinates are applied correctly.
Alternatively, calculate coordinates relative to the relative parent by subtracting the parent's client rect:
```tsx
onMouseMove={(e) => {
  const svgRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
  const containerRect = e.currentTarget.closest(".relative")?.getBoundingClientRect();
  if (svgRect && containerRect) {
    const relativeX = svgRect.left - containerRect.left + x - 80;
    const relativeY = svgRect.top - containerRect.top + y - 60;
    setHoveredData({
      chart: "BURNDOWN TRAJECTORY",
      label: d.date,
      value: `Actual: ${d.actual} SP / Ideal: ${d.ideal} SP`,
      x: relativeX,
      y: relativeY,
    });
  }
}}
```

## Info

### [FIXED] IN-01: Out-of-Sync Local State for Custom BG Image URL Input

**File:** `src/components/CustomizationDrawer.tsx:30`
**Issue:** The `customUrl` state is only initialized once when the drawer opens. If the user resets settings to defaults using the "RESET CONFIG TO DEFAULT" button, the background image resets to `/bg.webp` in the context, but the custom image URL text input retains its previous value since the local state `customUrl` is not cleared.
**Fix:**
Clear or sync the `customUrl` local state when `bgImage` changes in the context, or handle the reset action explicitly:
```tsx
// Sync local input state with context value
useEffect(() => {
  if (presetBgImages.some(img => img.value === bgImage)) {
    setCustomUrl("");
  } else {
    setCustomUrl(bgImage);
  }
}, [bgImage]);
```

---

_Reviewed: 2026-06-09T07:20:59Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
