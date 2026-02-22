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

  describe('default mode (all)', () => {
    it('matches keys', () => {
      const matches = searchNodes(parsed, 'request_id')
      expect(matches.length).toBe(2)
      expect(matches).toContain('$.request_id')
      expect(matches).toContain('$.user.request_id')
    })

    it('matches values', () => {
      const matches = searchNodes(parsed, 'Widget')
      expect(matches.length).toBe(1)
      expect(matches[0]).toBe('$.items[0].name')
    })

    it('matches both keys and values simultaneously', () => {
      const matches = searchNodes(parsed, 'name')
      expect(matches).toContain('$.user.name')
      expect(matches).toContain('$.items[0].name')
      expect(matches).toContain('$.items[1].name')
    })
  })

  describe('key: prefix mode', () => {
    it('only matches keys', () => {
      const matches = searchNodes(parsed, 'key:name')
      expect(matches.length).toBe(3)
      expect(matches).toContain('$.user.name')
      expect(matches).toContain('$.items[0].name')
      expect(matches).toContain('$.items[1].name')
    })

    it('does not match values when using key: prefix', () => {
      const matches = searchNodes(parsed, 'key:Alice')
      expect(matches.length).toBe(0)
    })
  })

  describe('value: prefix mode', () => {
    it('only matches values', () => {
      const matches = searchNodes(parsed, 'value:abc-123')
      expect(matches.length).toBe(1)
      expect(matches[0]).toBe('$.request_id')
    })

    it('does not match keys when using value: prefix', () => {
      const matches = searchNodes(parsed, 'value:request_id')
      expect(matches.length).toBe(0)
    })

    it('matches numeric values', () => {
      const matches = searchNodes(parsed, 'value:1')
      expect(matches.length).toBeGreaterThanOrEqual(1)
      expect(matches).toContain('$.items[0].id')
    })
  })

  describe('case insensitivity', () => {
    it('matches case-insensitively', () => {
      expect(searchNodes(parsed, 'alice').length).toBe(1)
      expect(searchNodes(parsed, 'ALICE').length).toBe(1)
      expect(searchNodes(parsed, 'AlIcE').length).toBe(1)
    })

    it('matches keys case-insensitively', () => {
      expect(searchNodes(parsed, 'REQUEST_ID').length).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('returns empty for empty query', () => {
      expect(searchNodes(parsed, '').length).toBe(0)
    })

    it('returns empty for whitespace-only query', () => {
      expect(searchNodes(parsed, '   ').length).toBe(0)
    })

    it('returns empty when no matches found', () => {
      expect(searchNodes(parsed, 'zzz_not_found').length).toBe(0)
    })

    it('handles key: with no following term', () => {
      expect(searchNodes(parsed, 'key:').length).toBe(0)
    })

    it('handles value: with no following term', () => {
      expect(searchNodes(parsed, 'value:').length).toBe(0)
    })

    it('matches partial strings', () => {
      const matches = searchNodes(parsed, 'abc')
      expect(matches.length).toBe(1)
      expect(matches[0]).toBe('$.request_id')
    })
  })

  describe('different value types', () => {
    const typed = parseJson({
      str: 'hello',
      num: 42,
      bool: true,
      nil: null,
    })

    it('matches string values', () => {
      expect(searchNodes(typed, 'hello').length).toBe(1)
    })

    it('matches number values as strings', () => {
      expect(searchNodes(typed, '42').length).toBe(1)
    })

    it('matches boolean values as strings', () => {
      expect(searchNodes(typed, 'true').length).toBe(1)
    })

    it('matches null values as the string "null"', () => {
      const matches = searchNodes(typed, 'null')
      expect(matches).toContain('$.nil')
    })
  })

  describe('nested search', () => {
    const deep = parseJson({
      level1: {
        level2: {
          level3: {
            target: 'found_it',
          },
        },
      },
    })

    it('finds deeply nested values', () => {
      const matches = searchNodes(deep, 'found_it')
      expect(matches.length).toBe(1)
      expect(matches[0]).toBe('$.level1.level2.level3.target')
    })

    it('finds deeply nested keys', () => {
      const matches = searchNodes(deep, 'target')
      expect(matches.length).toBe(1)
    })
  })
})
