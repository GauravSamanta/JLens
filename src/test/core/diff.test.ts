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
