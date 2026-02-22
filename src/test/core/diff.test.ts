import { describe, it, expect } from 'vitest'
import { diffJson } from '../../core/diff'

describe('diffJson', () => {
  describe('identical inputs', () => {
    it('detects no changes for identical flat objects', () => {
      const result = diffJson({ a: 1, b: 'two' }, { a: 1, b: 'two' })
      expect(result.modified).toBe(0)
      expect(result.added).toBe(0)
      expect(result.removed).toBe(0)
      expect(result.unchanged).toBe(2)
    })

    it('detects no changes for identical nested objects', () => {
      const obj = { user: { name: 'Alice', age: 30 } }
      const result = diffJson(obj, JSON.parse(JSON.stringify(obj)))
      expect(result.modified).toBe(0)
      expect(result.added).toBe(0)
      expect(result.removed).toBe(0)
    })

    it('detects no changes for identical arrays', () => {
      const result = diffJson([1, 2, 3], [1, 2, 3])
      expect(result.unchanged).toBe(3)
      expect(result.modified).toBe(0)
    })
  })

  describe('added keys', () => {
    it('detects a single added key', () => {
      const result = diffJson({ a: 1 }, { a: 1, b: 2 })
      expect(result.added).toBe(1)
      const entry = result.entries.find((e) => e.kind === 'added')!
      expect(entry.path).toBe('$.b')
      expect(entry.rightValue).toBe(2)
    })

    it('detects multiple added keys', () => {
      const result = diffJson({}, { a: 1, b: 2, c: 3 })
      expect(result.added).toBe(3)
    })

    it('detects added nested keys', () => {
      const result = diffJson({ user: {} }, { user: { name: 'Alice' } })
      expect(result.added).toBe(1)
      expect(result.entries.find((e) => e.kind === 'added')!.path).toBe('$.user.name')
    })
  })

  describe('removed keys', () => {
    it('detects a single removed key', () => {
      const result = diffJson({ a: 1, b: 2 }, { a: 1 })
      expect(result.removed).toBe(1)
      const entry = result.entries.find((e) => e.kind === 'removed')!
      expect(entry.path).toBe('$.b')
      expect(entry.leftValue).toBe(2)
    })

    it('detects all keys removed', () => {
      const result = diffJson({ a: 1, b: 2 }, {})
      expect(result.removed).toBe(2)
    })
  })

  describe('modified values', () => {
    it('detects modified primitive values', () => {
      const result = diffJson({ a: 1 }, { a: 2 })
      expect(result.modified).toBe(1)
      const entry = result.entries.find((e) => e.kind === 'modified')!
      expect(entry.leftValue).toBe(1)
      expect(entry.rightValue).toBe(2)
    })

    it('detects string to number change', () => {
      const result = diffJson({ a: 'hello' }, { a: 42 })
      expect(result.modified).toBe(1)
    })

    it('detects null to value change', () => {
      const result = diffJson({ a: null }, { a: 'now set' })
      expect(result.modified).toBe(1)
    })

    it('detects value to null change', () => {
      const result = diffJson({ a: 'was set' }, { a: null })
      expect(result.modified).toBe(1)
    })
  })

  describe('nested diffs', () => {
    it('detects changes in nested objects', () => {
      const left = { user: { name: 'Alice', age: 30 } }
      const right = { user: { name: 'Bob', age: 30 } }
      const result = diffJson(left, right)
      expect(result.modified).toBe(1)
      expect(result.unchanged).toBe(1)
      expect(result.entries.find((e) => e.kind === 'modified')!.path).toBe('$.user.name')
    })

    it('detects multiple nested changes', () => {
      const left = { a: { b: 1, c: 2 }, d: 3 }
      const right = { a: { b: 10, c: 20 }, d: 3 }
      const result = diffJson(left, right)
      expect(result.modified).toBe(2)
      expect(result.unchanged).toBe(1)
    })
  })

  describe('array diffs', () => {
    it('detects modified array elements', () => {
      const result = diffJson([1, 2, 3], [1, 99, 3])
      expect(result.modified).toBe(1)
      expect(result.unchanged).toBe(2)
    })

    it('detects added array elements', () => {
      const result = diffJson([1, 2], [1, 2, 3])
      expect(result.added).toBe(1)
      const added = result.entries.find((e) => e.kind === 'added')!
      expect(added.path).toBe('$[2]')
      expect(added.rightValue).toBe(3)
    })

    it('detects removed array elements', () => {
      const result = diffJson([1, 2, 3], [1, 2])
      expect(result.removed).toBe(1)
      const removed = result.entries.find((e) => e.kind === 'removed')!
      expect(removed.path).toBe('$[2]')
      expect(removed.leftValue).toBe(3)
    })

    it('handles nested array diffs', () => {
      const result = diffJson({ items: [1, 2] }, { items: [1, 3] })
      expect(result.modified).toBe(1)
      expect(result.entries.find((e) => e.kind === 'modified')!.path).toBe('$.items[1]')
    })

    it('handles array of objects', () => {
      const left = [{ id: 1, name: 'A' }]
      const right = [{ id: 1, name: 'B' }]
      const result = diffJson(left, right)
      expect(result.modified).toBe(1)
      expect(result.entries.find((e) => e.kind === 'modified')!.path).toBe('$[0].name')
    })
  })

  describe('type changes', () => {
    it('detects array to object change', () => {
      const result = diffJson({ data: [1, 2] }, { data: { a: 1 } })
      expect(result.modified).toBe(1)
    })

    it('detects object to array change', () => {
      const result = diffJson({ data: { a: 1 } }, { data: [1, 2] })
      expect(result.modified).toBe(1)
    })

    it('detects primitive to object change', () => {
      const result = diffJson({ a: 42 }, { a: { nested: true } })
      expect(result.modified).toBe(1)
    })
  })

  describe('summary counts', () => {
    it('counts all categories correctly', () => {
      const left = { same: 1, changed: 'old', gone: true }
      const right = { same: 1, changed: 'new', added: false }
      const result = diffJson(left, right)

      expect(result.unchanged).toBe(1)
      expect(result.modified).toBe(1)
      expect(result.removed).toBe(1)
      expect(result.added).toBe(1)
      expect(result.entries.length).toBe(4)
    })
  })

  describe('edge cases', () => {
    it('handles two empty objects', () => {
      const result = diffJson({}, {})
      expect(result.entries.length).toBe(0)
    })

    it('handles two empty arrays', () => {
      const result = diffJson([], [])
      expect(result.entries.length).toBe(0)
    })

    it('handles boolean comparison', () => {
      const result = diffJson({ flag: true }, { flag: false })
      expect(result.modified).toBe(1)
    })

    it('handles identical primitives at root', () => {
      const result = diffJson(42, 42)
      expect(result.unchanged).toBe(1)
      expect(result.modified).toBe(0)
    })

    it('handles different primitives at root', () => {
      const result = diffJson(42, 'hello')
      expect(result.modified).toBe(1)
    })
  })
})
