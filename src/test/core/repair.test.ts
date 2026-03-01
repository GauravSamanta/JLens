import { describe, it, expect } from 'vitest'
import { tryParseWithRepair } from '../../core/repair'

describe('tryParseWithRepair', () => {
  describe('valid JSON (fast path)', () => {
    it('parses valid JSON without repair', () => {
      const result = tryParseWithRepair('{"name": "Alice"}')
      expect(result.data).toEqual({ name: 'Alice' })
      expect(result.error).toBeNull()
      expect(result.wasRepaired).toBe(false)
      expect(result.repairedInput).toBeNull()
    })

    it('returns null data for empty input', () => {
      const result = tryParseWithRepair('')
      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
      expect(result.wasRepaired).toBe(false)
    })

    it('returns null data for whitespace-only input', () => {
      const result = tryParseWithRepair('   ')
      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
    })
  })

  describe('lenient parsing (repair path)', () => {
    it('fixes trailing commas', () => {
      const result = tryParseWithRepair('{"a": 1, "b": 2,}')
      expect(result.data).toEqual({ a: 1, b: 2 })
      expect(result.wasRepaired).toBe(true)
      expect(result.repairedInput).toBe('{"a": 1, "b": 2}')
    })

    it('fixes single quotes', () => {
      const result = tryParseWithRepair("{'name': 'Alice'}")
      expect(result.data).toEqual({ name: 'Alice' })
      expect(result.wasRepaired).toBe(true)
    })

    it('fixes unquoted keys', () => {
      const result = tryParseWithRepair('{name: "Alice", age: 30}')
      expect(result.data).toEqual({ name: 'Alice', age: 30 })
      expect(result.wasRepaired).toBe(true)
    })

    it('fixes Python-style booleans and None', () => {
      const result = tryParseWithRepair('{active: True, deleted: False, value: None}')
      expect(result.data).toEqual({ active: true, deleted: false, value: null })
      expect(result.wasRepaired).toBe(true)
    })

    it('strips single-line comments', () => {
      const input = '{\n  "a": 1, // this is a comment\n  "b": 2\n}'
      const result = tryParseWithRepair(input)
      expect(result.data).toEqual({ a: 1, b: 2 })
      expect(result.wasRepaired).toBe(true)
    })

    it('strips block comments', () => {
      const input = '{\n  /* comment */\n  "a": 1\n}'
      const result = tryParseWithRepair(input)
      expect(result.data).toEqual({ a: 1 })
      expect(result.wasRepaired).toBe(true)
    })
  })

  describe('unparseable input', () => {
    it('returns error for completely broken input', () => {
      const result = tryParseWithRepair('not json at all {{{}}}')
      expect(result.data).toBeNull()
      expect(result.error).not.toBeNull()
      expect(result.error!.message).toBeTruthy()
    })
  })
})
