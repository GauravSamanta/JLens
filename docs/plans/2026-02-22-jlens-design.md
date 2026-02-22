# JLens Design Document

**Date:** 2026-02-22
**Status:** Approved

## Overview

JLens is a browser-based, developer-first JSON debugging tool for inspecting, searching, and analyzing complex nested JSON structures. It targets backend engineers, data engineers, DevOps engineers, and API developers who regularly deal with log payloads, Kafka messages, and API responses.

The tool runs entirely client-side with no backend, deploys free on Vercel, and handles JSON payloads up to ~10MB without freezing the UI.

## Problem

Developers spend significant time navigating deeply nested JSON, searching for specific keys like `request_id`, running structured queries, understanding unknown JSON structures, and comparing payloads. Existing tools are either too basic (pretty-print only), too complex, or CLI-based and hard to visualize.

## Target Users

- **Primary:** Backend engineers, data engineers, DevOps engineers, API developers
- **Secondary:** Frontend developers, QA engineers

## Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Build | Vite 6 | Fast dev server, small production bundles, static output |
| UI | React 19 + TypeScript | Component model, rich ecosystem for tree/diff/virtual scroll |
| Styling | Tailwind CSS 4 | Dark/light theme support, utility-first, small CSS output |
| State | Zustand | Lightweight (~1KB), no boilerplate, good DevTools |
| Virtual scroll | @tanstack/react-virtual | Best-in-class virtualization for large tree rendering |
| JSON query | jsonpath-plus | Full JSONPath specification support |
| Diff engine | deep-diff or custom | Structural diff of JSON objects |
| Compression | lz-string | URL-safe compression for shareable links |
| Icons | lucide-react | Clean, consistent developer-oriented icon set |
| Deploy | Vercel Free Tier | Zero-config static deployment |

## Application Layout

Three modes accessible via toolbar tabs:

1. **Explore** (default) — Tree view + detail panel. Paste JSON, navigate the tree, click nodes for details.
2. **Diff** — Two input areas, diff results below. Toggle between side-by-side and inline views.
3. **Query** — JSONPath query bar, results below, tree view for context.

```
┌──────────────────────────────────────────────────────────┐
│  [JLens logo]   [Explore | Diff | Query]   [Theme] [?]  │
├──────────────────────────────────────────────────────────┤
│  Input Area (paste / file upload / drag-drop)            │
├──────────────┬───────────────────────────────────────────┤
│  Tree View   │  Detail Panel                             │
│  (virtualized│  (raw value, path, type, copy, table)     │
│   collapsible│                                           │
│   nodes)     │                                           │
├──────────────┴───────────────────────────────────────────┤
│  Search / Filter Bar                                     │
└──────────────────────────────────────────────────────────┘
```

## Data Architecture

### State Management (Zustand)

Four stores:

- **JsonStore** — parsed JSON data, tree expansion state, selected node path. Holds both left/right JSON for diff mode.
- **SearchStore** — current search query, match results (paths), active match index.
- **QueryStore** — JSONPath expression, results, query history.
- **UIStore** — active mode, theme, panel sizes, diff view style.

### JSON Parsing Strategy

1. Parse with native `JSON.parse()` (fastest available).
2. Build a flat node map: `Map<path, {key, value, type, depth, parentPath, childCount}>`.
3. Tree rendering reads from this flat map for fast virtualized rendering.
4. Search operates on the flat map (key/value matching without tree traversal).
5. For JSON > 5MB, parse in a **Web Worker** to avoid blocking UI.

### Performance Targets

- < 100ms parse + render for JSON under 1MB
- < 1s for JSON up to 10MB (with progress indicator)
- Search results appear as-you-type for < 1MB, debounced for larger payloads

## Feature Specifications

### Input Methods

- **Paste** from clipboard (primary method)
- **File upload** via file picker or drag-and-drop
- Auto-detect and parse on input
- Graceful error messages for invalid JSON with line/column of parse error

### Tree View

- Virtualized rendering with `@tanstack/react-virtual` (only visible nodes rendered)
- Expand/collapse with animations
- Color-coded by type: strings (green), numbers (blue), booleans (orange), null (gray)
- Array indices shown as `[0]`, `[1]`, etc.
- Collapsed node previews: `users {3}`, `items [12]`
- Click-to-copy JSONPath on any node

### Search

- Unified search bar supporting key search, value search, and combined
- Filter syntax: `key:request_id`, `value:abc-123`, or plain text (searches both)
- Highlights all matches in tree, auto-expands paths to matches
- Previous/next navigation (Enter/Shift+Enter)
- Result count: "3 of 17 matches"

### JSONPath Queries

- Query input with autocomplete based on current JSON structure
- Live preview of results as you type
- Results displayed as sub-tree or raw JSON
- Query history stored in localStorage

### Diff Comparison

- Two input panels (paste or upload into each)
- **Side-by-side view:** two tree panels with additions (green), deletions (red), modifications (yellow)
- **Inline view:** single tree with diff annotations
- Toggle between views
- Summary stats: "5 added, 3 removed, 2 modified"

### Flatten to Table

- When selecting an array of objects, offer "View as Table" button
- Sortable, filterable HTML table
- Columns auto-detected from object keys
- Handles heterogeneous objects (missing keys as empty cells)

### Shareable URLs

- JSON < 100KB: compress with `lz-string`, encode into URL hash
- Auto-populate on load from URL hash
- "Too large to share" message for bigger payloads
- Copy-to-clipboard button for share link

### Theme

- Dark theme (default) and light theme
- Toggle in toolbar
- Preference persisted in localStorage
- Respects `prefers-color-scheme` on first visit

## Non-Goals (Phase 1)

- No authentication
- No database persistence
- No real-time Kafka streaming
- No file storage
- No team collaboration
- No URL fetching (fetch from API endpoint)

## Input Methods

- Paste from clipboard
- File upload (.json files)

## Deployment

Static SPA build via `vite build`, deployed to Vercel Free Tier. No server-side rendering needed. Zero-config deployment with Vite's static output.
