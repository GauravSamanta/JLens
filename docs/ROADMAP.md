# JLens

> Browser-based JSON debugger for developers.
> Client-side only. Deploys free on Vercel.

---

## Architecture

```
src/
├── core/           parser, search, diff, share, types (pure logic, no React)
├── stores/         Zustand: jsonStore, searchStore, queryStore, uiStore
├── hooks/          React hooks bridging stores ↔ components
├── components/     UI: tree, detail panel, search bar, diff, query, table
└── workers/        Web Worker for parsing large payloads
```

**Stack:** Vite 7 · React 19 · TypeScript 5.9 · Tailwind 4 · Zustand 5 · @tanstack/react-virtual · jsonpath-plus · lz-string · Vitest

**Key decisions:**
- JSON parsed into flat `Map<path, JsonNode>` for fast search and virtualized rendering
- Payloads >5MB parsed in a Web Worker to keep UI responsive
- All processing client-side, no backend
- 156 tests across core, stores, hooks, and integration

---

## Progress

```
v1.0  ████████████████████  Shipped
v1.1  ░░░░░░░░░░░░░░░░░░░░  Next
v1.2  ░░░░░░░░░░░░░░░░░░░░  Planned
v1.3  ░░░░░░░░░░░░░░░░░░░░  Planned
v1.4  ░░░░░░░░░░░░░░░░░░░░  Planned
v2.0  ░░░░░░░░░░░░░░░░░░░░  Future
v3.0  ░░░░░░░░░░░░░░░░░░░░  Long-term
```

---

## v1.0 — Foundation `SHIPPED`

- [x] JSON parsing with flat node map
- [x] Web Worker for payloads >5MB
- [x] Virtualized tree view (handles 10k+ nodes)
- [x] Expand / collapse individual nodes
- [x] Expand all / collapse all via keyboard (`Ctrl+E` / `Ctrl+Shift+E`)
- [x] Color-coded types (string, number, boolean, null, object, array)
- [x] Collapsed previews (`{3}`, `[12]`)
- [x] Node selection with detail panel (path, type, full value)
- [x] Copy JSONPath with checkmark confirmation
- [x] Copy value with checkmark confirmation
- [x] Search: `key:`, `value:`, combined, case-insensitive
- [x] Match highlighting + next/prev navigation + count
- [x] Auto-expand ancestor nodes to reveal matches
- [x] JSONPath query with live evaluation (jsonpath-plus)
- [x] Query history (localStorage, max 50, deduplicated)
- [x] Copy query results
- [x] Structural diff engine (recursive, path-based)
- [x] Side-by-side + inline diff views with toggle
- [x] Diff summary (added, removed, modified counts)
- [x] Flatten array-of-objects to scrollable table
- [x] Shareable URLs via lz-string compression (<100KB)
- [x] Dark theme (default) + light theme with toggle
- [x] Theme persistence in localStorage + prefers-color-scheme
- [x] Paste + file upload + drag-and-drop input
- [x] String truncation in tree (60 chars + ellipsis)
- [x] Loading spinner during large payload parsing
- [x] 156 tests passing
- [x] Production build: 79KB gzipped

---

## v1.1 — Input & Navigation `NEXT`

_Make the first 10 seconds feel seamless._

- [ ] **Lenient JSON parser** — auto-fix malformed JSON: unquoted keys, single quotes, trailing commas, Python-style (`True`/`False`/`None`), comments. Show "Fixed N issues" banner with option to copy corrected JSON
- [ ] **Expand/collapse all UI buttons** — visible buttons in tree toolbar (keyboard shortcuts already work)
- [ ] **Keyboard shortcuts legend** — discoverable shortcut reference (Ctrl+K, Ctrl+E, etc.)
- [ ] **Breadcrumb path bar** — clickable trail: `$ > data > users > [0] > name`
- [ ] **Format / minify toggle** — switch between pretty-printed and compact raw view
- [ ] **Better parse errors** — show line/column of JSON syntax error, highlight the problem

---

## v1.2 — Deeper Analysis `PLANNED`

_Go beyond browsing — understand the structure._

- [ ] **Structure stats panel** — node count by type, depth distribution, payload size
- [ ] **Syntax-highlighted raw view** — read-only editor with JSON coloring
- [ ] **Table column sorting** — click headers to sort
- [ ] **Table column filtering** — filter rows by value
- [ ] **Type distribution chart** — visual breakdown of types in the payload

---

## v1.3 — Query Power `PLANNED`

_Make the query tab a real tool._

- [ ] **JSONPath autocomplete** — suggest paths based on current JSON structure
- [ ] **Export query results** — download results as `.json` file
- [ ] **Multiple result formats** — view as tree, table, or raw JSON
- [ ] **Query templates** — pre-built queries: "all keys", "find nulls", "unique values of X"

---

## v1.4 — Workflow & Persistence `PLANNED`

_Remember what I was doing._

- [ ] **Local history** — recent JSON payloads in IndexedDB, quick re-open
- [ ] **Tabs / multi-document** — open multiple payloads, switch between them
- [ ] **Bookmarked nodes** — pin paths to revisit across sessions
- [ ] **Export view state** — save expanded nodes + selection as a snapshot

---

## v2.0 — Live Data `FUTURE`

_Work with JSON that's still moving._

- [ ] **URL fetch** — paste an API endpoint, fetch and parse the response
- [ ] **Request builder** — set method, headers, body for API calls
- [ ] **Auto-refresh** — poll an endpoint, highlight what changed
- [ ] **WebSocket / SSE viewer** — connect to streaming endpoint, inspect messages

---

## v3.0 — Collaboration `LONG-TERM`

_JSON debugging is a team sport._

- [ ] **Team sharing** — share payload + annotations via short link (requires backend)
- [ ] **Annotations / comments** — add notes to specific nodes
- [ ] **Multi-way diff** — compare 3+ JSON documents
- [ ] **Embed mode** — iframe-embeddable viewer for docs and dashboards

---

## Parking Lot

_Ideas without a home. Pull into a version when ready._

- [ ] Schema validation (JSON Schema / Zod)
- [ ] JQ expression support alongside JSONPath
- [ ] CSV / YAML import (convert to JSON, then explore)
- [ ] Browser extension (inspect JSON in DevTools)
- [ ] VS Code extension
- [ ] WASM-based parser for faster large payloads
- [ ] Accessibility audit + screen reader support
- [ ] i18n / localization
- [ ] PWA support (install as desktop app, works offline)
