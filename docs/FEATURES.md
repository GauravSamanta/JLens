# JLens — Feature Documentation

> Living document tracking all features, their status, and evolution.
> Last updated: 2026-02-22 | Current version: **1.0.0**

---

## v1.0.0 — Foundation

### Core Engine

| Feature | Status | Notes |
|---|---|---|
| JSON parsing via `JSON.parse()` + flat node map | Done | Recursive walker builds `Map<path, JsonNode>` |
| Web Worker for large payloads (>5MB) | Done | Offloads parsing to keep UI responsive |
| Type detection (string, number, boolean, null, object, array) | Done | |
| Path generation (JSONPath-style: `$.users[0].name`) | Done | |
| Depth tracking and parent-child relationships | Done | |

### Explore Mode

| Feature | Status | Notes |
|---|---|---|
| Paste JSON to parse | Done | Auto-detect and parse on input |
| File upload (.json) | Done | File picker button |
| Virtualized tree view | Done | `@tanstack/react-virtual`, handles 10k+ nodes |
| Expand / collapse nodes | Done | Click chevron or node |
| Expand all / collapse all | Done | Via store actions |
| Color-coded types | Done | Green=string, blue=number, orange=boolean, gray=null, mauve=object, yellow=array |
| Collapsed previews | Done | Shows `{3}` for objects, `[12]` for arrays |
| Node selection with detail panel | Done | Click a node to see full value, path, type |
| Copy JSONPath on hover | Done | Copy icon on each tree row with checkmark confirmation |
| Copy path from detail panel | Done | With checkmark confirmation |
| Copy value from detail panel | Done | With checkmark confirmation |
| String truncation in tree | Done | Long strings truncated at 60 chars with ellipsis |
| Flatten array-of-objects to table | Done | "View as Table" button in detail panel |
| Loading spinner for large payloads | Done | Shown during Web Worker parsing |

### Search

| Feature | Status | Notes |
|---|---|---|
| Unified search bar | Done | Bottom of explore mode |
| Search by key: `key:fieldname` | Done | |
| Search by value: `value:abc-123` | Done | |
| Search both (plain text) | Done | Default mode, matches keys and values |
| Case-insensitive matching | Done | |
| Match highlighting in tree | Done | Yellow highlight on matching rows |
| Active match highlight | Done | Distinct highlight + ring on current match |
| Next / previous navigation | Done | Arrow buttons + keyboard |
| Match counter | Done | Shows "2 of 5" |
| Auto-expand to matches | Done | Ancestor nodes expanded to reveal matches |
| Debounced search for large payloads | Done | 300ms debounce when >10k nodes |

### JSONPath Query

| Feature | Status | Notes |
|---|---|---|
| JSONPath expression input | Done | Using `jsonpath-plus` |
| Live evaluation with debounce | Done | 300ms debounce |
| Results display as formatted JSON | Done | Pretty-printed with `JSON.stringify(_, _, 2)` |
| Copy query results | Done | Copy button with checkmark confirmation |
| Query history | Done | Stored in `localStorage`, max 50 entries |
| History dropdown | Done | Click to re-run past queries |
| Clear history | Done | |
| Error display for invalid expressions | Done | |

### Diff Comparison

| Feature | Status | Notes |
|---|---|---|
| Two input panels (left / right) | Done | |
| Structural diff engine | Done | Custom recursive differ |
| Side-by-side view | Done | Default view |
| Inline view | Done | Toggle between views |
| Color-coded changes | Done | Green=added, red=removed, yellow=modified |
| Summary stats | Done | "X added, Y removed, Z modified" |
| Diff on nested objects | Done | Recursive path-based comparison |
| Array diff (by index) | Done | |

### Shareable URLs

| Feature | Status | Notes |
|---|---|---|
| Compress JSON into URL hash | Done | `lz-string` compression |
| Auto-load from URL hash on visit | Done | |
| Size limit (100KB) | Done | Larger payloads show share button disabled |
| Copy share link | Done | Toolbar button with "Copied" feedback |

### UI / Theme

| Feature | Status | Notes |
|---|---|---|
| Dark theme (default) | Done | Warm color palette, DM Sans + JetBrains Mono |
| Light theme | Done | Warm parchment tones |
| Theme toggle | Done | Sun/Moon icon in toolbar |
| Persist theme preference | Done | `localStorage` |
| Respect `prefers-color-scheme` | Done | On first visit |
| Subtle noise texture | Done | Adds depth to background |
| Custom scrollbar styling | Done | Thin, pill-shaped, themed |

### Table View

| Feature | Status | Notes |
|---|---|---|
| Auto-detect array of objects | Done | Shows "View as Table" when ≥50% children are objects |
| Columns from object keys | Done | |
| Scrollable table | Done | Horizontal + vertical scroll |

---

## Test Coverage

| Module | Tests | What's covered |
|---|---|---|
| `core/parser` | 20 | Flat/nested/arrays, all types, edge cases, large payloads |
| `core/search` | 22 | Key/value/all modes, case insensitivity, prefixes, types |
| `core/diff` | 28 | Add/remove/modify, nested, arrays, type changes, summaries |
| `core/share` | 13 | Encode/decode, round-trips, size limits, URL safety |
| `stores/jsonStore` | 20 | Parse, expand/collapse, selection, diff inputs |
| `stores/uiStore` | 13 | Mode switching, theme toggle, localStorage |
| `stores/searchStore` | 11 | Query, match navigation, wrapping, clear |
| `stores/queryStore` | 11 | Expression, results/error, history dedup/limit |
| `hooks/useVisibleNodes` | 9 | Tree traversal, expansion, ordering |
| Integration | 9 | End-to-end workflows, performance benchmarks |
| **Total** | **156** | |

---

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Build | Vite | 7.x |
| UI | React | 19.x |
| Language | TypeScript | 5.9 |
| Styling | Tailwind CSS | 4.x |
| State | Zustand | 5.x |
| Virtualization | @tanstack/react-virtual | 3.x |
| JSONPath | jsonpath-plus | 10.x |
| Compression | lz-string | 1.5 |
| Icons | lucide-react | 0.575 |
| Testing | Vitest + React Testing Library | 4.x |

---

## Architecture

```
src/
├── core/           # Pure logic (no React)
│   ├── parser.ts   # JSON → flat node map
│   ├── search.ts   # Key/value search over node map
│   ├── diff.ts     # Structural JSON comparison
│   ├── share.ts    # URL compression/decompression
│   └── types.ts    # Shared type definitions
├── stores/         # Zustand state management
│   ├── jsonStore    # Parsed data, tree state, selection
│   ├── searchStore  # Search query, matches, navigation
│   ├── queryStore   # JSONPath expression, results, history
│   └── uiStore      # Mode, theme, diff view style
├── hooks/          # React hooks bridging stores ↔ components
│   ├── useVisibleNodes  # Computes visible tree nodes from expansion state
│   ├── useSearch        # Debounced search with auto-expand
│   ├── useDiff          # Memoized diff computation
│   ├── useJsonPath      # Debounced JSONPath evaluation
│   └── useShareUrl      # URL hash encoding/decoding
├── components/     # React UI components
│   ├── Toolbar      # Mode tabs, theme toggle, share button
│   ├── JsonInput    # Paste/upload textarea
│   ├── TreeView     # Virtualized tree container
│   ├── TreeNode     # Individual tree row
│   ├── DetailPanel  # Selected node inspector
│   ├── SearchBar    # Search input with navigation
│   ├── QueryPanel   # JSONPath query interface
│   ├── DiffView     # Diff results display
│   ├── DiffInput    # Diff text inputs
│   ├── TableView    # Array-of-objects table
│   └── CopyButton   # Reusable copy-with-confirmation
└── workers/
    └── parser.worker  # Off-thread parsing for large JSON
```

---

## Future Ideas (Not Committed)

_Potential features for future versions. Nothing here is planned — just a parking lot._

- Drag-and-drop file input
- URL fetch (paste API endpoint, fetch and parse)
- JSONPath autocomplete based on current structure
- Keyboard shortcuts (Cmd+F for search, Cmd+E for expand all)
- Breadcrumb path bar showing current selection
- Structure stats panel (node counts by type, depth histogram)
- Format / minify toggle for raw view
- Local history of recently opened JSON payloads
- Syntax-highlighted raw JSON view
- Export filtered/queried results as JSON file
- Column sorting and filtering in table view
- Real-time Kafka/WebSocket streaming
- Team collaboration (shared sessions)
- Multiple tabs for comparing >2 payloads
