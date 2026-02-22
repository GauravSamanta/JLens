# JLens Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a browser-based JSON debugging tool with tree navigation, search, JSONPath queries, diff comparison, flatten-to-table, and shareable URLs.

**Architecture:** Single-page React app with Zustand stores for state management. JSON is parsed into a flat node map for fast search and virtualized tree rendering. All processing is client-side; heavy payloads (>5MB) are parsed in a Web Worker. Deploys as a static SPA to Vercel.

**Tech Stack:** Vite 6, React 19, TypeScript, Tailwind CSS 4, Zustand, @tanstack/react-virtual, jsonpath-plus, lz-string, lucide-react, vitest + @testing-library/react

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Create: `tailwind.config.ts`, `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `vercel.json`
- Create: `vitest.config.ts`

**Step 1: Scaffold Vite + React + TypeScript project**

Run:
```bash
npm create vite@latest . -- --template react-ts
```

**Step 2: Install core dependencies**

Run:
```bash
npm install zustand @tanstack/react-virtual jsonpath-plus lz-string lucide-react
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom @types/lz-string
```

**Step 3: Configure Tailwind CSS**

Update `vite.config.ts` to include the Tailwind plugin:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Replace `src/index.css` with:

```css
@import "tailwindcss";
```

**Step 4: Configure Vitest**

Add to `vite.config.ts` or create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

Create `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

**Step 5: Create Vercel config for SPA routing**

Create `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Step 6: Create minimal App shell**

Replace `src/App.tsx` with:

```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-4 py-3">
        <h1 className="text-xl font-bold">JLens</h1>
      </header>
      <main className="p-4">
        <p className="text-gray-400">JSON debugger loading...</p>
      </main>
    </div>
  )
}

export default App
```

**Step 7: Verify everything works**

Run: `npm run dev`
Expected: App loads at localhost:5173 with "JLens" header and dark background.

Run: `npm run build`
Expected: Successful build with no errors.

**Step 8: Add test script to package.json and run**

Add to `package.json` scripts: `"test": "vitest run", "test:watch": "vitest"`

Run: `npx vitest run`
Expected: Test runner starts (0 tests initially, no errors).

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript project with Tailwind and Vitest"
```

---

### Task 2: JSON Parser & Flat Node Map

This is the core data structure that powers tree rendering, search, and queries.

**Files:**
- Create: `src/core/parser.ts`
- Create: `src/core/types.ts`
- Create: `src/test/core/parser.test.ts`

**Step 1: Define core types**

Create `src/core/types.ts`:

```typescript
export type JsonNodeType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'

export interface JsonNode {
  id: string        // JSONPath-like path, e.g. "$.users[0].name"
  key: string       // display key, e.g. "name", "[0]"
  value: unknown    // raw value (primitives only; objects/arrays stored as undefined)
  type: JsonNodeType
  depth: number
  parentId: string | null
  childIds: string[]
  childCount: number // number of direct children
  index: number     // position among siblings
}

export interface ParseResult {
  nodes: Map<string, JsonNode>
  rootId: string
  totalNodes: number
  maxDepth: number
}
```

**Step 2: Write failing tests for parser**

Create `src/test/core/parser.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseJson } from '../../core/parser'

describe('parseJson', () => {
  it('parses a simple object', () => {
    const result = parseJson({ name: 'Alice', age: 30 })
    expect(result.totalNodes).toBe(3) // root + 2 keys
    expect(result.rootId).toBe('$')

    const root = result.nodes.get('$')!
    expect(root.type).toBe('object')
    expect(root.childCount).toBe(2)

    const name = result.nodes.get('$.name')!
    expect(name.type).toBe('string')
    expect(name.value).toBe('Alice')
    expect(name.key).toBe('name')
    expect(name.depth).toBe(1)
  })

  it('parses nested objects', () => {
    const result = parseJson({ user: { address: { city: 'NYC' } } })
    expect(result.maxDepth).toBe(3)

    const city = result.nodes.get('$.user.address.city')!
    expect(city.value).toBe('NYC')
    expect(city.depth).toBe(3)
    expect(city.parentId).toBe('$.user.address')
  })

  it('parses arrays', () => {
    const result = parseJson({ items: [1, 2, 3] })
    const items = result.nodes.get('$.items')!
    expect(items.type).toBe('array')
    expect(items.childCount).toBe(3)

    const second = result.nodes.get('$.items[1]')!
    expect(second.value).toBe(2)
    expect(second.key).toBe('[1]')
  })

  it('handles null and boolean values', () => {
    const result = parseJson({ active: true, deleted: false, notes: null })
    expect(result.nodes.get('$.active')!.type).toBe('boolean')
    expect(result.nodes.get('$.active')!.value).toBe(true)
    expect(result.nodes.get('$.notes')!.type).toBe('null')
    expect(result.nodes.get('$.notes')!.value).toBeNull()
  })

  it('handles empty objects and arrays', () => {
    const result = parseJson({ obj: {}, arr: [] })
    expect(result.nodes.get('$.obj')!.childCount).toBe(0)
    expect(result.nodes.get('$.arr')!.childCount).toBe(0)
  })

  it('handles top-level array', () => {
    const result = parseJson([1, 2, 3])
    expect(result.rootId).toBe('$')
    const root = result.nodes.get('$')!
    expect(root.type).toBe('array')
    expect(root.childCount).toBe(3)
  })

  it('handles top-level primitive', () => {
    const result = parseJson('hello')
    const root = result.nodes.get('$')!
    expect(root.type).toBe('string')
    expect(root.value).toBe('hello')
  })
})
```

**Step 3: Run tests to verify they fail**

Run: `npx vitest run src/test/core/parser.test.ts`
Expected: FAIL — module `../../core/parser` not found

**Step 4: Implement the parser**

Create `src/core/parser.ts`:

```typescript
import type { JsonNode, JsonNodeType, ParseResult } from './types'

function getType(value: unknown): JsonNodeType {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value as JsonNodeType
}

export function parseJson(data: unknown): ParseResult {
  const nodes = new Map<string, JsonNode>()
  let maxDepth = 0

  function walk(value: unknown, id: string, key: string, depth: number, parentId: string | null, index: number): void {
    const type = getType(value)
    maxDepth = Math.max(maxDepth, depth)

    const node: JsonNode = {
      id,
      key,
      value: type === 'object' || type === 'array' ? undefined : value,
      type,
      depth,
      parentId,
      childIds: [],
      childCount: 0,
      index,
    }

    nodes.set(id, node)

    if (type === 'object' && value !== null) {
      const entries = Object.entries(value as Record<string, unknown>)
      node.childCount = entries.length
      entries.forEach(([k, v], i) => {
        const childId = `${id}.${k}`
        node.childIds.push(childId)
        walk(v, childId, k, depth + 1, id, i)
      })
    } else if (type === 'array') {
      const arr = value as unknown[]
      node.childCount = arr.length
      arr.forEach((item, i) => {
        const childId = `${id}[${i}]`
        node.childIds.push(childId)
        walk(item, childId, `[${i}]`, depth + 1, id, i)
      })
    }
  }

  walk(data, '$', '$', 0, null, 0)

  return { nodes, rootId: '$', totalNodes: nodes.size, maxDepth }
}
```

**Step 5: Run tests to verify they pass**

Run: `npx vitest run src/test/core/parser.test.ts`
Expected: All 7 tests PASS

**Step 6: Commit**

```bash
git add src/core/types.ts src/core/parser.ts src/test/core/parser.test.ts
git commit -m "feat: add JSON parser with flat node map data structure"
```

---

### Task 3: Zustand Stores

**Files:**
- Create: `src/stores/jsonStore.ts`
- Create: `src/stores/uiStore.ts`
- Create: `src/stores/searchStore.ts`
- Create: `src/stores/queryStore.ts`

**Step 1: Create the UI store**

Create `src/stores/uiStore.ts`:

```typescript
import { create } from 'zustand'

export type AppMode = 'explore' | 'diff' | 'query'
export type DiffViewStyle = 'side-by-side' | 'inline'
export type Theme = 'dark' | 'light'

interface UIState {
  mode: AppMode
  theme: Theme
  diffViewStyle: DiffViewStyle
  setMode: (mode: AppMode) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setDiffViewStyle: (style: DiffViewStyle) => void
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('jlens-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export const useUIStore = create<UIState>((set) => ({
  mode: 'explore',
  theme: getInitialTheme(),
  diffViewStyle: 'side-by-side',
  setMode: (mode) => set({ mode }),
  setTheme: (theme) => {
    localStorage.setItem('jlens-theme', theme)
    set({ theme })
  },
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('jlens-theme', next)
      return { theme: next }
    }),
  setDiffViewStyle: (diffViewStyle) => set({ diffViewStyle }),
}))
```

**Step 2: Create the JSON store**

Create `src/stores/jsonStore.ts`:

```typescript
import { create } from 'zustand'
import type { ParseResult } from '../core/types'
import { parseJson } from '../core/parser'

interface JsonState {
  rawInput: string
  parseResult: ParseResult | null
  parseError: string | null
  expandedNodes: Set<string>
  selectedNodeId: string | null

  // Diff mode
  rawInputLeft: string
  rawInputRight: string
  parseResultLeft: ParseResult | null
  parseResultRight: ParseResult | null

  setRawInput: (input: string) => void
  setRawInputLeft: (input: string) => void
  setRawInputRight: (input: string) => void
  toggleNode: (nodeId: string) => void
  expandNode: (nodeId: string) => void
  collapseNode: (nodeId: string) => void
  expandAll: () => void
  collapseAll: () => void
  selectNode: (nodeId: string | null) => void
  expandToNode: (nodeId: string) => void
}

function tryParse(input: string): { result: ParseResult | null; error: string | null } {
  if (!input.trim()) return { result: null, error: null }
  try {
    const data = JSON.parse(input)
    return { result: parseJson(data), error: null }
  } catch (e) {
    return { result: null, error: (e as Error).message }
  }
}

export const useJsonStore = create<JsonState>((set, get) => ({
  rawInput: '',
  parseResult: null,
  parseError: null,
  expandedNodes: new Set<string>(['$']),
  selectedNodeId: null,

  rawInputLeft: '',
  rawInputRight: '',
  parseResultLeft: null,
  parseResultRight: null,

  setRawInput: (input) => {
    const { result, error } = tryParse(input)
    set({
      rawInput: input,
      parseResult: result,
      parseError: error,
      expandedNodes: new Set(['$']),
      selectedNodeId: null,
    })
  },

  setRawInputLeft: (input) => {
    const { result } = tryParse(input)
    set({ rawInputLeft: input, parseResultLeft: result })
  },

  setRawInputRight: (input) => {
    const { result } = tryParse(input)
    set({ rawInputRight: input, parseResultRight: result })
  },

  toggleNode: (nodeId) =>
    set((state) => {
      const next = new Set(state.expandedNodes)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return { expandedNodes: next }
    }),

  expandNode: (nodeId) =>
    set((state) => {
      const next = new Set(state.expandedNodes)
      next.add(nodeId)
      return { expandedNodes: next }
    }),

  collapseNode: (nodeId) =>
    set((state) => {
      const next = new Set(state.expandedNodes)
      next.delete(nodeId)
      return { expandedNodes: next }
    }),

  expandAll: () => {
    const { parseResult } = get()
    if (!parseResult) return
    const all = new Set<string>()
    for (const [id, node] of parseResult.nodes) {
      if (node.type === 'object' || node.type === 'array') all.add(id)
    }
    set({ expandedNodes: all })
  },

  collapseAll: () => set({ expandedNodes: new Set(['$']) }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  expandToNode: (nodeId) =>
    set((state) => {
      const { parseResult } = state
      if (!parseResult) return state
      const next = new Set(state.expandedNodes)
      let current = nodeId
      while (current) {
        const node = parseResult.nodes.get(current)
        if (!node) break
        next.add(current)
        if (!node.parentId) break
        current = node.parentId
      }
      return { expandedNodes: next }
    }),
}))
```

**Step 3: Create the search store**

Create `src/stores/searchStore.ts`:

```typescript
import { create } from 'zustand'

interface SearchState {
  query: string
  matchIds: string[]
  activeMatchIndex: number
  setQuery: (query: string) => void
  setMatchIds: (ids: string[]) => void
  nextMatch: () => void
  prevMatch: () => void
  clearSearch: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  matchIds: [],
  activeMatchIndex: 0,

  setQuery: (query) => set({ query, activeMatchIndex: 0 }),

  setMatchIds: (matchIds) => set({ matchIds, activeMatchIndex: 0 }),

  nextMatch: () =>
    set((state) => ({
      activeMatchIndex:
        state.matchIds.length > 0 ? (state.activeMatchIndex + 1) % state.matchIds.length : 0,
    })),

  prevMatch: () =>
    set((state) => ({
      activeMatchIndex:
        state.matchIds.length > 0
          ? (state.activeMatchIndex - 1 + state.matchIds.length) % state.matchIds.length
          : 0,
    })),

  clearSearch: () => set({ query: '', matchIds: [], activeMatchIndex: 0 }),
}))
```

**Step 4: Create the query store**

Create `src/stores/queryStore.ts`:

```typescript
import { create } from 'zustand'

interface QueryState {
  expression: string
  results: unknown | null
  error: string | null
  history: string[]
  setExpression: (expression: string) => void
  setResults: (results: unknown | null) => void
  setError: (error: string | null) => void
  addToHistory: (expression: string) => void
  clearHistory: () => void
}

const MAX_HISTORY = 50

function loadHistory(): string[] {
  try {
    const stored = localStorage.getItem('jlens-query-history')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const useQueryStore = create<QueryState>((set) => ({
  expression: '',
  results: null,
  error: null,
  history: loadHistory(),

  setExpression: (expression) => set({ expression }),

  setResults: (results) => set({ results, error: null }),

  setError: (error) => set({ error, results: null }),

  addToHistory: (expression) =>
    set((state) => {
      const filtered = state.history.filter((h) => h !== expression)
      const next = [expression, ...filtered].slice(0, MAX_HISTORY)
      localStorage.setItem('jlens-query-history', JSON.stringify(next))
      return { history: next }
    }),

  clearHistory: () => {
    localStorage.removeItem('jlens-query-history')
    set({ history: [] })
  },
}))
```

**Step 5: Commit**

```bash
git add src/stores/
git commit -m "feat: add Zustand stores for JSON, UI, search, and query state"
```

---

### Task 4: Search Engine

**Files:**
- Create: `src/core/search.ts`
- Create: `src/test/core/search.test.ts`

**Step 1: Write failing tests**

Create `src/test/core/search.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { searchNodes } from '../../core/search'
import { parseJson } from '../../core/parser'

describe('searchNodes', () => {
  const data = {
    request_id: 'abc-123',
    user: { name: 'Alice', request_id: 'def-456' },
    items: [{ id: 1, name: 'Widget' }, { id: 2, name: 'Gadget' }],
  }
  const parsed = parseJson(data)

  it('searches keys and values by default', () => {
    const matches = searchNodes(parsed, 'request_id')
    expect(matches.length).toBe(2)
  })

  it('searches by key prefix', () => {
    const matches = searchNodes(parsed, 'key:name')
    expect(matches.length).toBe(3) // user.name, items[0].name, items[1].name
  })

  it('searches by value prefix', () => {
    const matches = searchNodes(parsed, 'value:abc-123')
    expect(matches.length).toBe(1)
    expect(matches[0]).toBe('$.request_id')
  })

  it('case-insensitive search', () => {
    const matches = searchNodes(parsed, 'alice')
    expect(matches.length).toBe(1)
  })

  it('returns empty for no match', () => {
    const matches = searchNodes(parsed, 'zzz_not_found')
    expect(matches.length).toBe(0)
  })

  it('handles empty query', () => {
    const matches = searchNodes(parsed, '')
    expect(matches.length).toBe(0)
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/test/core/search.test.ts`
Expected: FAIL

**Step 3: Implement search**

Create `src/core/search.ts`:

```typescript
import type { ParseResult } from './types'

export function searchNodes(parseResult: ParseResult, query: string): string[] {
  if (!query.trim()) return []

  let mode: 'all' | 'key' | 'value' = 'all'
  let searchTerm = query.trim()

  if (searchTerm.startsWith('key:')) {
    mode = 'key'
    searchTerm = searchTerm.slice(4)
  } else if (searchTerm.startsWith('value:')) {
    mode = 'value'
    searchTerm = searchTerm.slice(6)
  }

  if (!searchTerm) return []

  const lower = searchTerm.toLowerCase()
  const matches: string[] = []

  for (const [id, node] of parseResult.nodes) {
    const keyMatch = node.key.toLowerCase().includes(lower)
    const valueStr = node.value !== undefined ? String(node.value) : ''
    const valueMatch = valueStr.toLowerCase().includes(lower)

    if (mode === 'key' && keyMatch) matches.push(id)
    else if (mode === 'value' && valueMatch) matches.push(id)
    else if (mode === 'all' && (keyMatch || valueMatch)) matches.push(id)
  }

  return matches
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/test/core/search.test.ts`
Expected: All 6 tests PASS

**Step 5: Commit**

```bash
git add src/core/search.ts src/test/core/search.test.ts
git commit -m "feat: add search engine with key/value/combined search modes"
```

---

### Task 5: JSON Diff Engine

**Files:**
- Create: `src/core/diff.ts`
- Create: `src/core/diff-types.ts`
- Create: `src/test/core/diff.test.ts`

**Step 1: Define diff types**

Create `src/core/diff-types.ts`:

```typescript
export type DiffKind = 'added' | 'removed' | 'modified' | 'unchanged'

export interface DiffEntry {
  path: string
  kind: DiffKind
  leftValue?: unknown
  rightValue?: unknown
}

export interface DiffResult {
  entries: DiffEntry[]
  added: number
  removed: number
  modified: number
  unchanged: number
}
```

**Step 2: Write failing tests**

Create `src/test/core/diff.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { diffJson } from '../../core/diff'

describe('diffJson', () => {
  it('detects no changes for identical objects', () => {
    const result = diffJson({ a: 1 }, { a: 1 })
    expect(result.modified).toBe(0)
    expect(result.added).toBe(0)
    expect(result.removed).toBe(0)
  })

  it('detects added keys', () => {
    const result = diffJson({ a: 1 }, { a: 1, b: 2 })
    expect(result.added).toBe(1)
    const entry = result.entries.find((e) => e.kind === 'added')!
    expect(entry.path).toBe('$.b')
    expect(entry.rightValue).toBe(2)
  })

  it('detects removed keys', () => {
    const result = diffJson({ a: 1, b: 2 }, { a: 1 })
    expect(result.removed).toBe(1)
  })

  it('detects modified values', () => {
    const result = diffJson({ a: 1 }, { a: 2 })
    expect(result.modified).toBe(1)
    const entry = result.entries.find((e) => e.kind === 'modified')!
    expect(entry.leftValue).toBe(1)
    expect(entry.rightValue).toBe(2)
  })

  it('handles nested diffs', () => {
    const left = { user: { name: 'Alice', age: 30 } }
    const right = { user: { name: 'Bob', age: 30 } }
    const result = diffJson(left, right)
    expect(result.modified).toBe(1)
    expect(result.entries.find((e) => e.kind === 'modified')!.path).toBe('$.user.name')
  })

  it('handles array diffs', () => {
    const result = diffJson({ items: [1, 2] }, { items: [1, 3] })
    expect(result.modified).toBe(1)
  })
})
```

**Step 3: Run tests to verify they fail**

Run: `npx vitest run src/test/core/diff.test.ts`
Expected: FAIL

**Step 4: Implement diff engine**

Create `src/core/diff.ts`:

```typescript
import type { DiffEntry, DiffResult } from './diff-types'

export function diffJson(left: unknown, right: unknown): DiffResult {
  const entries: DiffEntry[] = []

  function walk(l: unknown, r: unknown, path: string): void {
    if (l === r) {
      if (typeof l !== 'object' || l === null) {
        entries.push({ path, kind: 'unchanged', leftValue: l, rightValue: r })
      }
      return
    }

    if (l === null || r === null || typeof l !== typeof r || Array.isArray(l) !== Array.isArray(r)) {
      entries.push({ path, kind: 'modified', leftValue: l, rightValue: r })
      return
    }

    if (Array.isArray(l) && Array.isArray(r)) {
      const maxLen = Math.max(l.length, r.length)
      for (let i = 0; i < maxLen; i++) {
        const childPath = `${path}[${i}]`
        if (i >= l.length) {
          entries.push({ path: childPath, kind: 'added', rightValue: r[i] })
        } else if (i >= r.length) {
          entries.push({ path: childPath, kind: 'removed', leftValue: l[i] })
        } else {
          walk(l[i], r[i], childPath)
        }
      }
      return
    }

    if (typeof l === 'object' && typeof r === 'object') {
      const lObj = l as Record<string, unknown>
      const rObj = r as Record<string, unknown>
      const allKeys = new Set([...Object.keys(lObj), ...Object.keys(rObj)])

      for (const key of allKeys) {
        const childPath = `${path}.${key}`
        if (!(key in lObj)) {
          entries.push({ path: childPath, kind: 'added', rightValue: rObj[key] })
        } else if (!(key in rObj)) {
          entries.push({ path: childPath, kind: 'removed', leftValue: lObj[key] })
        } else {
          walk(lObj[key], rObj[key], childPath)
        }
      }
      return
    }

    entries.push({ path, kind: 'modified', leftValue: l, rightValue: r })
  }

  walk(left, right, '$')

  return {
    entries,
    added: entries.filter((e) => e.kind === 'added').length,
    removed: entries.filter((e) => e.kind === 'removed').length,
    modified: entries.filter((e) => e.kind === 'modified').length,
    unchanged: entries.filter((e) => e.kind === 'unchanged').length,
  }
}
```

**Step 5: Run tests to verify they pass**

Run: `npx vitest run src/test/core/diff.test.ts`
Expected: All 6 tests PASS

**Step 6: Commit**

```bash
git add src/core/diff.ts src/core/diff-types.ts src/test/core/diff.test.ts
git commit -m "feat: add JSON diff engine with structural comparison"
```

---

### Task 6: Shareable URL Utility

**Files:**
- Create: `src/core/share.ts`
- Create: `src/test/core/share.test.ts`

**Step 1: Write failing tests**

Create `src/test/core/share.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { encodeJsonToHash, decodeJsonFromHash } from '../../core/share'

describe('share utils', () => {
  it('round-trips small JSON', () => {
    const json = '{"hello":"world"}'
    const hash = encodeJsonToHash(json)
    expect(hash).toBeTruthy()
    const decoded = decodeJsonFromHash(hash!)
    expect(decoded).toBe(json)
  })

  it('returns null for JSON > 100KB', () => {
    const big = JSON.stringify({ data: 'x'.repeat(200_000) })
    expect(encodeJsonToHash(big)).toBeNull()
  })

  it('returns null for empty input', () => {
    expect(encodeJsonToHash('')).toBeNull()
  })

  it('returns null for invalid hash', () => {
    expect(decodeJsonFromHash('not-valid')).toBeNull()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/test/core/share.test.ts`
Expected: FAIL

**Step 3: Implement share utils**

Create `src/core/share.ts`:

```typescript
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

const MAX_SHAREABLE_SIZE = 100_000

export function encodeJsonToHash(json: string): string | null {
  if (!json || json.length > MAX_SHAREABLE_SIZE) return null
  try {
    return compressToEncodedURIComponent(json)
  } catch {
    return null
  }
}

export function decodeJsonFromHash(hash: string): string | null {
  if (!hash) return null
  try {
    const result = decompressFromEncodedURIComponent(hash)
    return result || null
  } catch {
    return null
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/test/core/share.test.ts`
Expected: All 4 tests PASS

**Step 5: Commit**

```bash
git add src/core/share.ts src/test/core/share.test.ts
git commit -m "feat: add URL sharing utils with lz-string compression"
```

---

### Task 7: Toolbar & Theme Toggle Component

**Files:**
- Create: `src/components/Toolbar.tsx`
- Modify: `src/App.tsx`

**Step 1: Create the Toolbar component**

Create `src/components/Toolbar.tsx`:

```tsx
import { Sun, Moon, HelpCircle } from 'lucide-react'
import { useUIStore, type AppMode } from '../stores/uiStore'

const modes: { id: AppMode; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'diff', label: 'Diff' },
  { id: 'query', label: 'Query' },
]

export function Toolbar() {
  const { mode, setMode, theme, toggleTheme } = useUIStore()

  return (
    <header className="flex items-center justify-between border-b border-gray-800 dark:border-gray-800 light:border-gray-200 px-4 py-2">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-bold tracking-tight text-white dark:text-white">
          <span className="text-blue-400">J</span>Lens
        </h1>
        <nav className="flex gap-1">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === m.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
          aria-label="Help"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  )
}
```

**Step 2: Update App.tsx to use Toolbar and apply theme**

Replace `src/App.tsx`:

```tsx
import { Toolbar } from './components/Toolbar'
import { useUIStore } from './stores/uiStore'

function App() {
  const theme = useUIStore((s) => s.theme)

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-950 text-gray-100 dark:bg-gray-950 dark:text-gray-100">
        <Toolbar />
        <main className="p-4">
          <p className="text-gray-500">Paste or upload JSON to get started.</p>
        </main>
      </div>
    </div>
  )
}

export default App
```

**Step 3: Verify visually**

Run: `npm run dev`
Expected: Toolbar with JLens logo, Explore/Diff/Query tabs, theme toggle. Clicking tabs switches active state. Theme toggle swaps icon.

**Step 4: Commit**

```bash
git add src/components/Toolbar.tsx src/App.tsx
git commit -m "feat: add toolbar with mode tabs and theme toggle"
```

---

### Task 8: JSON Input Component

**Files:**
- Create: `src/components/JsonInput.tsx`
- Modify: `src/App.tsx`

**Step 1: Create the JSON input component**

Create `src/components/JsonInput.tsx` with a textarea for pasting, file upload button, and drag-and-drop support. The component should:

- Accept `onSubmit: (json: string) => void` prop
- Show a textarea with placeholder text
- Have a "Format" button that pretty-prints valid JSON
- Have an "Upload File" button
- Support drag-and-drop of .json files
- Show parse errors inline
- Auto-parse on paste (with debounce for large payloads)

**Step 2: Wire into App.tsx**

Connect the input component to `useJsonStore.setRawInput` so parsed data flows into the store.

**Step 3: Verify visually**

Run: `npm run dev`
Expected: Textarea visible, pasting JSON triggers parse, errors shown for invalid JSON.

**Step 4: Commit**

```bash
git add src/components/JsonInput.tsx src/App.tsx
git commit -m "feat: add JSON input component with paste, upload, and drag-drop"
```

---

### Task 9: Tree View Component

This is the most complex UI component. It renders the parsed JSON as an expandable/collapsible tree using virtualization.

**Files:**
- Create: `src/components/TreeView.tsx`
- Create: `src/components/TreeNode.tsx`
- Create: `src/hooks/useVisibleNodes.ts`
- Modify: `src/App.tsx`

**Step 1: Create the visible nodes hook**

Create `src/hooks/useVisibleNodes.ts`. This hook takes the ParseResult and expandedNodes set, and returns a flat list of visible node IDs (in DFS order, skipping collapsed subtrees). This flat list is what gets virtualized.

```typescript
import { useMemo } from 'react'
import type { ParseResult } from '../core/types'

export function useVisibleNodes(parseResult: ParseResult | null, expandedNodes: Set<string>): string[] {
  return useMemo(() => {
    if (!parseResult) return []
    const visible: string[] = []

    function walk(nodeId: string) {
      const node = parseResult.nodes.get(nodeId)
      if (!node) return
      visible.push(nodeId)
      if ((node.type === 'object' || node.type === 'array') && expandedNodes.has(nodeId)) {
        node.childIds.forEach(walk)
      }
    }

    walk(parseResult.rootId)
    return visible
  }, [parseResult, expandedNodes])
}
```

**Step 2: Create the TreeNode component**

Create `src/components/TreeNode.tsx`. Each node renders:
- Indentation based on depth
- Expand/collapse chevron for objects/arrays
- Key name
- Value (for primitives) with type-based coloring
- Child count badge for collapsed containers: `{3}` or `[12]`
- Click-to-copy path button (appears on hover)

**Step 3: Create the TreeView component**

Create `src/components/TreeView.tsx`. Uses `@tanstack/react-virtual` to virtualize the visible nodes list. Each row renders a `TreeNode`.

**Step 4: Wire into App.tsx**

Show TreeView when parseResult is available. Place it in the main content area.

**Step 5: Verify visually**

Run: `npm run dev`
Paste a sample JSON. Expected: Tree renders with expand/collapse, type colors, indentation. Large JSON (>1000 nodes) should scroll smoothly.

**Step 6: Commit**

```bash
git add src/components/TreeView.tsx src/components/TreeNode.tsx src/hooks/useVisibleNodes.ts src/App.tsx
git commit -m "feat: add virtualized tree view with expand/collapse and type colors"
```

---

### Task 10: Detail Panel

**Files:**
- Create: `src/components/DetailPanel.tsx`
- Modify: `src/App.tsx`

**Step 1: Create the DetailPanel component**

Shows details for the selected node:
- Full JSONPath
- Type badge
- Raw value (formatted JSON for objects/arrays)
- Copy value button
- Copy path button
- "View as Table" button if selected node is an array of objects (leads to Task 13)

**Step 2: Wire into App.tsx**

Split the main content area into tree (left) and detail (right) using flexbox.

**Step 3: Verify visually**

Click a node in tree. Expected: Detail panel updates with node info.

**Step 4: Commit**

```bash
git add src/components/DetailPanel.tsx src/App.tsx
git commit -m "feat: add detail panel showing selected node info"
```

---

### Task 11: Search Bar & Integration

**Files:**
- Create: `src/components/SearchBar.tsx`
- Create: `src/hooks/useSearch.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/TreeNode.tsx` (add highlight logic)

**Step 1: Create the search hook**

Create `src/hooks/useSearch.ts`. This hook connects the SearchStore with the parser's search function. It runs the search (debounced) whenever the query changes, updates matchIds in the store, and auto-expands paths to matches.

**Step 2: Create the SearchBar component**

Create `src/components/SearchBar.tsx`:
- Text input with search icon
- "3 of 17 matches" counter
- Up/down arrows to navigate between matches
- Clear button
- Hint text showing syntax: `key:`, `value:`, or plain text

**Step 3: Update TreeNode to highlight matches**

Add a `isMatch` prop and `isActiveMatch` prop. Highlighted nodes get a colored background. Active match scrolls into view.

**Step 4: Wire into App.tsx**

Add SearchBar to the footer area. Connect search state.

**Step 5: Verify visually**

Paste JSON, type a search term. Expected: matching nodes highlighted, counter updates, arrow navigation works.

**Step 6: Commit**

```bash
git add src/components/SearchBar.tsx src/hooks/useSearch.ts src/components/TreeNode.tsx src/App.tsx
git commit -m "feat: add search bar with key/value filtering and match navigation"
```

---

### Task 12: JSONPath Query Panel

**Files:**
- Create: `src/components/QueryPanel.tsx`
- Create: `src/hooks/useJsonPath.ts`
- Modify: `src/App.tsx`

**Step 1: Create the JSONPath hook**

Create `src/hooks/useJsonPath.ts`. Uses `jsonpath-plus` to evaluate expressions against the raw parsed JSON. Returns results or error. Debounced for live preview.

**Step 2: Create the QueryPanel component**

Create `src/components/QueryPanel.tsx`:
- Query input at top
- History dropdown
- Results area showing matched values as formatted JSON or sub-tree
- Error display for invalid expressions
- "Run" button and Enter-to-run

**Step 3: Wire into App.tsx**

Show QueryPanel when mode is 'query'. Pass the raw parsed data.

**Step 4: Verify visually**

Paste JSON, switch to Query mode, type `$.users[0].name`. Expected: result appears live.

**Step 5: Commit**

```bash
git add src/components/QueryPanel.tsx src/hooks/useJsonPath.ts src/App.tsx
git commit -m "feat: add JSONPath query panel with live results and history"
```

---

### Task 13: Diff View

**Files:**
- Create: `src/components/DiffView.tsx`
- Create: `src/components/DiffInput.tsx`
- Create: `src/hooks/useDiff.ts`
- Modify: `src/App.tsx`

**Step 1: Create the diff hook**

Create `src/hooks/useDiff.ts`. Connects the JsonStore's left/right parse results with the diff engine. Returns the DiffResult.

**Step 2: Create the DiffInput component**

Two side-by-side textareas (or a left/right layout) for entering the two JSON payloads. Each has its own paste/upload support.

**Step 3: Create the DiffView component**

Create `src/components/DiffView.tsx`:
- Summary bar: "5 added, 3 removed, 2 modified"
- Toggle: side-by-side vs inline
- Side-by-side: two columns, lines colored by diff kind
- Inline: single column with additions/deletions annotated
- Scrolling synced between panels in side-by-side mode

**Step 4: Wire into App.tsx**

Show DiffInput + DiffView when mode is 'diff'.

**Step 5: Verify visually**

Paste two slightly different JSONs. Expected: diff highlights appear, summary is correct, toggle works.

**Step 6: Commit**

```bash
git add src/components/DiffView.tsx src/components/DiffInput.tsx src/hooks/useDiff.ts src/App.tsx
git commit -m "feat: add diff view with side-by-side and inline modes"
```

---

### Task 14: Flatten to Table

**Files:**
- Create: `src/components/TableView.tsx`
- Modify: `src/components/DetailPanel.tsx`

**Step 1: Create the TableView component**

Create `src/components/TableView.tsx`:
- Receives an array of objects
- Auto-detects columns from all object keys (union)
- Renders a sortable HTML table
- Click column header to sort (asc/desc toggle)
- Missing keys shown as empty cells
- Scrollable for wide tables

**Step 2: Add "View as Table" to DetailPanel**

When selected node is an array of objects, show a button. Clicking opens the TableView.

**Step 3: Verify visually**

Paste JSON with an array of objects, select it. Click "View as Table". Expected: table renders with correct columns.

**Step 4: Commit**

```bash
git add src/components/TableView.tsx src/components/DetailPanel.tsx
git commit -m "feat: add flatten-to-table view for arrays of objects"
```

---

### Task 15: Shareable URLs Integration

**Files:**
- Create: `src/hooks/useShareUrl.ts`
- Modify: `src/components/Toolbar.tsx` (add share button)
- Modify: `src/App.tsx` (load from URL hash on mount)

**Step 1: Create the share hook**

Create `src/hooks/useShareUrl.ts`:
- `generateShareUrl()`: takes current rawInput, encodes to hash, returns full URL
- `loadFromUrl()`: checks window.location.hash on mount, decodes and loads JSON

**Step 2: Add share button to Toolbar**

Show a "Share" button (link icon). On click, generates URL and copies to clipboard. Shows toast "Link copied!"

**Step 3: Load from URL on mount**

In App.tsx, on mount check if URL has a hash. If so, decode and populate the input.

**Step 4: Verify**

Paste small JSON, click Share. Copy URL to new tab. Expected: JSON loads automatically.

**Step 5: Commit**

```bash
git add src/hooks/useShareUrl.ts src/components/Toolbar.tsx src/App.tsx
git commit -m "feat: add shareable URLs with lz-string compression"
```

---

### Task 16: Polish & Dark/Light Theme

**Files:**
- Modify: `src/index.css` (theme variables)
- Modify: Various components for light theme support
- Modify: `index.html` (meta tags, favicon)

**Step 1: Implement dark/light theme**

Ensure all components properly support both themes. Use Tailwind's `dark:` variant. Apply the `dark` class to the root based on UIStore theme.

**Step 2: Add meta tags and title**

Update `index.html` with proper title, description, Open Graph tags.

**Step 3: Add keyboard shortcuts**

- `Ctrl/Cmd + K`: focus search
- `Ctrl/Cmd + E`: expand all
- `Ctrl/Cmd + Shift + E`: collapse all
- `Escape`: clear search / close panels

**Step 4: Add loading/empty states**

Empty state with instructions when no JSON is loaded. Loading spinner for large payloads.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: polish UI with theme support, keyboard shortcuts, and empty states"
```

---

### Task 17: Performance Optimization & Web Worker

**Files:**
- Create: `src/workers/parser.worker.ts`
- Modify: `src/stores/jsonStore.ts` (use worker for large payloads)

**Step 1: Create the parser Web Worker**

Create `src/workers/parser.worker.ts` that runs `JSON.parse` + `parseJson` off the main thread. Post result back via message.

**Step 2: Integrate worker into JsonStore**

For payloads > 5MB (`rawInput.length > 5_000_000`), use the worker. Show a progress indicator while parsing.

**Step 3: Test with large JSON**

Generate a ~8MB JSON payload. Paste it. Expected: UI stays responsive, progress indicator shows, tree renders after parse completes.

**Step 4: Commit**

```bash
git add src/workers/parser.worker.ts src/stores/jsonStore.ts
git commit -m "feat: add Web Worker for parsing large JSON payloads"
```

---

### Task 18: Build & Deploy

**Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass.

**Step 2: Build for production**

Run: `npm run build`
Expected: Successful build, output in `dist/`.

**Step 3: Test production build locally**

Run: `npx vite preview`
Expected: App works correctly at localhost:4173.

**Step 4: Deploy to Vercel**

Run:
```bash
npx vercel --prod
```
Or connect GitHub repo to Vercel dashboard for automatic deployments.

**Step 5: Commit any final tweaks**

```bash
git add -A
git commit -m "chore: finalize production build and Vercel deployment"
```
