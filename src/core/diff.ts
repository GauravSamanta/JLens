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
