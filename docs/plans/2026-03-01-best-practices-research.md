# JLens Best Practices Research (2026-03-01)

---

## Quick Wins (Do Now)

### Code Quality Fixes

| Fix | Impact | Effort |
|-----|--------|--------|
| **Fix Zustand selectors in TreeView** — switch from destructuring to individual `(s) => s.field` selectors | Prevents re-renders on unrelated state changes | 5 min |
| **Add `getItemKey` to virtualizer** — pass `getItemKey: (index) => visibleNodeIds[index]` | Stable row identity during expand/collapse | 2 min |
| **Batch `expandToNode` calls** — add `expandNodes(ids: string[])` action, call once instead of N times | Eliminates N intermediate state updates during search | 15 min |
| **Add `scrollToIndex` for search matches** — scroll virtualizer to active match | Match may be expanded but off-screen currently | 10 min |
| **Duplicate `ParseErrorInfo`** — defined in both `core/types.ts` and `core/repair.ts`, keep one | Clean up | 2 min |
| **Worker race condition** — add request ID to prevent stale responses | Bug fix | 10 min |
| **Add `noUncheckedIndexedAccess`** to tsconfig | Catches undefined array access bugs | 5 min |
| **Add exhaustive `assertNever`** — compile-time safety for union switches | Prevents missed cases when types expand | 10 min |

### Performance Wins

| Fix | Impact | Effort |
|-----|--------|--------|
| **Wrap search updates in `startTransition`** | Keeps typing responsive during highlight render | 10 min |
| **Move search to Web Worker** | Prevents UI freeze for 50k+ node searches | 30 min |
| **Transfer parsed data as ArrayBuffer** | Near-instant worker→main transfer vs structured clone | 20 min |
| **Build pre-lowercased search index during parse** | Avoids `.toLowerCase()` on every node per search | 15 min |
| **Cap auto-expand on search** — only expand active match ancestors | Prevents expanding entire tree on broad searches | 20 min |

---

## Accessibility (P0 Priority)

### Tree View ARIA (Biggest Gap)

The tree currently uses `<div>` elements with no ARIA roles, no semantic structure, and no keyboard interaction. This is the single highest-priority accessibility gap.

**Required changes:**
1. Add `role="tree"` on container, `role="treeitem"` on each row
2. Add `aria-expanded`, `aria-level`, `aria-posinset`, `aria-setsize`
3. Implement W3C TreeView keyboard navigation: `↑`/`↓`/`←`/`→`/`Home`/`End`/`Enter`
4. Use roving tabindex pattern (one item has `tabindex="0"`, rest have `tabindex="-1"`)
5. Add visible focus indicator (`ring-2 ring-accent-blue`)

**Reference:** W3C TreeView Pattern, GitHub's accessible tree view implementation.

### Color Contrast

- Audit all type colors against both themes for WCAG AA (4.5:1 ratio)
- `null` values (`text-text-faint` / `text-gray-400`) likely fail — gray-400 on white is ~2.7:1
- Don't rely on color alone — add secondary type indicators (quotes, italic, icons)

---

## JSON Viewer UX Patterns (From Industry Research)

### Features Other Tools Do Well

| Feature | Who Does It | Priority for JLens |
|---------|-------------|-------------------|
| **Recursive expand** (Alt+Click) | Chrome DevTools | High — quick win |
| **Expand to depth N** | Edge JSON Viewer | Medium |
| **Copy subtree as JSON** | Postman, Chrome | High — easy to add |
| **Filter mode** (hide non-matching trees) | Firefox DevTools | Medium — alongside current highlight mode |
| **Context menu** (right-click for actions) | Chrome DevTools | Medium |
| **Type-ahead search** in tree | W3C recommended | Low |

### Standard Keyboard Shortcuts

| Key | Action | JLens Status |
|-----|--------|-------------|
| `↑`/`↓` | Navigate tree | Missing |
| `←`/`→` | Collapse/expand | Missing |
| `Home`/`End` | First/last node | Missing |
| `Enter` | Select node | Missing |
| `*` | Expand all siblings | Missing |
| `Ctrl+F` | Open search | Have `Ctrl+K` |
| `Ctrl+E` | Expand all | Implemented |
| `Ctrl+Shift+E` | Collapse all | Implemented |

---

## Architecture Improvements

### Tailwind 4: Eliminate `isDark` Ternaries

Use `@custom-variant dark` to define dark theme overrides in CSS. This eliminates every `isDark ? X : Y` conditional in components — just use `bg-base` and it auto-resolves.

```css
@custom-variant dark (&:where(.dark, .dark *));
@theme { --color-base: #f8f6f1; }
@variant dark { --color-base: #1e1d25; }
```

### Zustand Best Practices

- Use `useShallow` for multi-value selectors
- Use `getInitialState()` for test resets
- Consider `immer` middleware if state updates get complex
- Actions are stable references — select them individually

### React 19 Readiness

- React Compiler will auto-memoize most `useMemo`/`useCallback` — don't add more manual memoization
- Enable compiler via `babel-plugin-react-compiler` in Vite config when ready
- Use `startTransition` for non-urgent updates (search highlighting)
- Ref callback cleanup replaces `useEffect` + `useRef` pairs

### Project Config

- Add `@/` path alias to avoid deep relative imports
- Remove `puppeteer` from devDependencies (unused, ~400MB with Chromium)
- Consider `prettier-plugin-tailwindcss` for class ordering
- Use `satisfies` for type-safe config objects

---

## v1.2 Feature Guidance

### Structure Stats + Type Chart: Combine Into One Panel

Both compute counts from the same `Map<string, JsonNode>`. Build one `StatsPanel` component.

- **Computation:** Single O(n) pass with `useMemo`, keyed on `parseResult`
- **Chart:** CSS-only horizontal bars — zero new dependencies. Use existing accent colors.
- **Placement:** Replace "Select a node" in DetailPanel when nothing is selected
- **Stats to show:** Total nodes, max depth, payload size, count by type, depth distribution

### Syntax-Highlighted Raw View: Use Shiki

- **Shiki** (~34KB gzip) — VS Code-quality TextMate highlighting, always read-only, no editor overhead
- Fine-grained bundle: `shiki/core` + `shiki/engine/javascript` + JSON grammar only
- Create custom themes matching JLens accent colors
- For large JSON (>100KB): virtualize by line with `@tanstack/react-virtual`
- Avoid: Monaco (~2MB), CodeMirror 6 (~100KB) — overkill for read-only

### Table Filtering: Keep Custom, No Library

- Add inline subheader filter row with text inputs per column
- Case-insensitive `includes` filter — covers 90% of use cases
- ~30 lines of additional code in existing `TableView`
- Debounce filter input for 50k+ rows
- Don't add `@tanstack/react-table` — overkill for sort+filter

### Table Sorting: Minor Improvements

- Add `aria-sort` to `<th>` elements
- Show sort affordance on hover for unsorted columns
- Skip multi-column sort — not worth the UX complexity

---

## Bundle Impact Summary

| Addition | Size (gzip) |
|----------|------------|
| jsonrepair (v1.1, already added) | +4 KB |
| Shiki core + JSON (v1.2, recommended) | +34 KB |
| CSS-only charts (v1.2) | 0 KB |
| Custom filtering (v1.2) | 0 KB |
| clsx + tailwind-merge (optional) | +3.7 KB |
| **Total projected v1.2 build** | **~120 KB** |

---

## Key References

- W3C TreeView Pattern: w3.org/WAI/ARIA/apg/patterns/treeview/
- GitHub Accessible Tree View: github.blog/engineering/user-experience/considerations-for-making-a-tree-view-component-accessible/
- Zustand useShallow: zustand docs
- TanStack Virtual getItemKey: tanstack.com/virtual
- Shiki Fine-Grained Bundle: shiki.style/guide/install#fine-grained-bundle
- WebAIM Contrast Checker: webaim.org/resources/contrastchecker/
