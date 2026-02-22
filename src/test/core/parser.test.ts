import { describe, it, expect } from 'vitest'
import { parseJson } from '../../core/parser'

describe('parseJson', () => {
  describe('simple objects', () => {
    it('parses a flat object with string and number', () => {
      const result = parseJson({ name: 'Alice', age: 30 })
      expect(result.totalNodes).toBe(3)
      expect(result.rootId).toBe('$')

      const root = result.nodes.get('$')!
      expect(root.type).toBe('object')
      expect(root.childCount).toBe(2)
      expect(root.depth).toBe(0)
      expect(root.parentId).toBeNull()

      const name = result.nodes.get('$.name')!
      expect(name.type).toBe('string')
      expect(name.value).toBe('Alice')
      expect(name.key).toBe('name')
      expect(name.depth).toBe(1)
      expect(name.parentId).toBe('$')
      expect(name.index).toBe(0)
    })

    it('preserves key ordering', () => {
      const result = parseJson({ z: 1, a: 2, m: 3 })
      const root = result.nodes.get('$')!
      expect(root.childIds).toEqual(['$.z', '$.a', '$.m'])
    })
  })

  describe('nested structures', () => {
    it('parses deeply nested objects', () => {
      const result = parseJson({ user: { address: { city: 'NYC' } } })
      expect(result.maxDepth).toBe(3)

      const city = result.nodes.get('$.user.address.city')!
      expect(city.value).toBe('NYC')
      expect(city.depth).toBe(3)
      expect(city.parentId).toBe('$.user.address')
    })

    it('tracks parent-child relationships correctly', () => {
      const result = parseJson({ a: { b: { c: 1 } } })
      const a = result.nodes.get('$.a')!
      const b = result.nodes.get('$.a.b')!
      const c = result.nodes.get('$.a.b.c')!

      expect(a.childIds).toEqual(['$.a.b'])
      expect(b.parentId).toBe('$.a')
      expect(b.childIds).toEqual(['$.a.b.c'])
      expect(c.parentId).toBe('$.a.b')
      expect(c.childIds).toEqual([])
    })
  })

  describe('arrays', () => {
    it('parses arrays with correct indices', () => {
      const result = parseJson({ items: [1, 2, 3] })
      const items = result.nodes.get('$.items')!
      expect(items.type).toBe('array')
      expect(items.childCount).toBe(3)
      expect(items.childIds).toEqual(['$.items[0]', '$.items[1]', '$.items[2]'])

      const second = result.nodes.get('$.items[1]')!
      expect(second.value).toBe(2)
      expect(second.key).toBe('[1]')
      expect(second.index).toBe(1)
    })

    it('parses array of objects', () => {
      const result = parseJson({ users: [{ name: 'Alice' }, { name: 'Bob' }] })
      const alice = result.nodes.get('$.users[0].name')!
      expect(alice.value).toBe('Alice')
      const bob = result.nodes.get('$.users[1].name')!
      expect(bob.value).toBe('Bob')
    })

    it('parses nested arrays', () => {
      const result = parseJson([[1, 2], [3, 4]])
      const root = result.nodes.get('$')!
      expect(root.type).toBe('array')
      expect(root.childCount).toBe(2)

      const inner = result.nodes.get('$[0]')!
      expect(inner.type).toBe('array')
      expect(inner.childCount).toBe(2)

      const val = result.nodes.get('$[0][1]')!
      expect(val.value).toBe(2)
    })
  })

  describe('primitive types', () => {
    it('handles null values', () => {
      const result = parseJson({ notes: null })
      const node = result.nodes.get('$.notes')!
      expect(node.type).toBe('null')
      expect(node.value).toBeNull()
    })

    it('handles boolean values', () => {
      const result = parseJson({ active: true, deleted: false })
      expect(result.nodes.get('$.active')!.type).toBe('boolean')
      expect(result.nodes.get('$.active')!.value).toBe(true)
      expect(result.nodes.get('$.deleted')!.value).toBe(false)
    })

    it('handles number types', () => {
      const result = parseJson({ int: 42, float: 3.14, negative: -1, zero: 0 })
      expect(result.nodes.get('$.int')!.value).toBe(42)
      expect(result.nodes.get('$.float')!.value).toBe(3.14)
      expect(result.nodes.get('$.negative')!.value).toBe(-1)
      expect(result.nodes.get('$.zero')!.value).toBe(0)
    })
  })

  describe('edge cases', () => {
    it('handles empty objects and arrays', () => {
      const result = parseJson({ obj: {}, arr: [] })
      expect(result.nodes.get('$.obj')!.childCount).toBe(0)
      expect(result.nodes.get('$.obj')!.childIds).toEqual([])
      expect(result.nodes.get('$.arr')!.childCount).toBe(0)
    })

    it('handles top-level array', () => {
      const result = parseJson([1, 2, 3])
      const root = result.nodes.get('$')!
      expect(root.type).toBe('array')
      expect(root.childCount).toBe(3)
    })

    it('handles top-level primitive string', () => {
      const result = parseJson('hello')
      const root = result.nodes.get('$')!
      expect(root.type).toBe('string')
      expect(root.value).toBe('hello')
      expect(root.childIds).toEqual([])
    })

    it('handles top-level number', () => {
      const result = parseJson(42)
      const root = result.nodes.get('$')!
      expect(root.type).toBe('number')
      expect(root.value).toBe(42)
    })

    it('handles top-level null', () => {
      const result = parseJson(null)
      const root = result.nodes.get('$')!
      expect(root.type).toBe('null')
      expect(root.value).toBeNull()
    })

    it('handles top-level boolean', () => {
      const result = parseJson(true)
      const root = result.nodes.get('$')!
      expect(root.type).toBe('boolean')
      expect(root.value).toBe(true)
    })

    it('containers store undefined as value', () => {
      const result = parseJson({ a: [1] })
      expect(result.nodes.get('$')!.value).toBeUndefined()
      expect(result.nodes.get('$.a')!.value).toBeUndefined()
    })

    it('handles special string values', () => {
      const result = parseJson({ empty: '', unicode: '\u00e9\u00e0\u00fc', newline: 'a\nb' })
      expect(result.nodes.get('$.empty')!.value).toBe('')
      expect(result.nodes.get('$.unicode')!.value).toBe('\u00e9\u00e0\u00fc')
      expect(result.nodes.get('$.newline')!.value).toBe('a\nb')
    })

    it('handles large flat object', () => {
      const obj: Record<string, number> = {}
      for (let i = 0; i < 1000; i++) obj[`key${i}`] = i
      const result = parseJson(obj)
      expect(result.totalNodes).toBe(1001)
      expect(result.nodes.get('$.key999')!.value).toBe(999)
    })
  })

  describe('realistic payloads', () => {
    it('parses an API response structure', () => {
      const apiResponse = {
        status: 200,
        data: {
          users: [
            { id: 1, name: 'Alice', roles: ['admin', 'user'] },
            { id: 2, name: 'Bob', roles: ['user'] },
          ],
          pagination: { page: 1, total: 100, per_page: 20 },
        },
        meta: { request_id: 'abc-123', timestamp: '2026-01-01' },
      }
      const result = parseJson(apiResponse)

      expect(result.nodes.get('$.data.users[0].name')!.value).toBe('Alice')
      expect(result.nodes.get('$.data.users[0].roles[0]')!.value).toBe('admin')
      expect(result.nodes.get('$.data.pagination.total')!.value).toBe(100)
      expect(result.nodes.get('$.meta.request_id')!.value).toBe('abc-123')
      expect(result.maxDepth).toBe(5)
    })
  })
})
