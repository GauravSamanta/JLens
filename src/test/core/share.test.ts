import { describe, it, expect } from 'vitest'
import { encodeJsonToHash, decodeJsonFromHash } from '../../core/share'

describe('share utils', () => {
  describe('encodeJsonToHash', () => {
    it('encodes small JSON strings', () => {
      const hash = encodeJsonToHash('{"hello":"world"}')
      expect(hash).toBeTruthy()
      expect(typeof hash).toBe('string')
    })

    it('returns null for empty input', () => {
      expect(encodeJsonToHash('')).toBeNull()
    })

    it('returns null for JSON > 100KB', () => {
      const big = JSON.stringify({ data: 'x'.repeat(200_000) })
      expect(encodeJsonToHash(big)).toBeNull()
    })

    it('encodes JSON at exactly the limit', () => {
      const json = 'x'.repeat(100_000)
      expect(encodeJsonToHash(json)).toBeTruthy()
    })

    it('returns null for JSON just over the limit', () => {
      const json = 'x'.repeat(100_001)
      expect(encodeJsonToHash(json)).toBeNull()
    })
  })

  describe('decodeJsonFromHash', () => {
    it('returns null for empty hash', () => {
      expect(decodeJsonFromHash('')).toBeNull()
    })

    it('returns null for invalid hash', () => {
      expect(decodeJsonFromHash('not-valid-lz-data')).toBeNull()
    })
  })

  describe('round-trip', () => {
    it('round-trips simple JSON', () => {
      const json = '{"hello":"world"}'
      const hash = encodeJsonToHash(json)!
      const decoded = decodeJsonFromHash(hash)
      expect(decoded).toBe(json)
    })

    it('round-trips complex JSON', () => {
      const json = JSON.stringify({
        users: [
          { id: 1, name: 'Alice', roles: ['admin'] },
          { id: 2, name: 'Bob', roles: ['user'] },
        ],
        meta: { total: 2, page: 1 },
      })
      const hash = encodeJsonToHash(json)!
      expect(decodeJsonFromHash(hash)).toBe(json)
    })

    it('round-trips JSON with special characters', () => {
      const json = JSON.stringify({ emoji: '\u2764\ufe0f', unicode: '\u00e9\u00e0\u00fc', newline: 'a\nb' })
      const hash = encodeJsonToHash(json)!
      expect(decodeJsonFromHash(hash)).toBe(json)
    })

    it('round-trips empty object', () => {
      const json = '{}'
      const hash = encodeJsonToHash(json)!
      expect(decodeJsonFromHash(hash)).toBe(json)
    })

    it('round-trips a single value', () => {
      const json = '"just a string"'
      const hash = encodeJsonToHash(json)!
      expect(decodeJsonFromHash(hash)).toBe(json)
    })

    it('produces URL-safe output', () => {
      const json = '{"key":"value with spaces & symbols!@#$%"}'
      const hash = encodeJsonToHash(json)!
      expect(hash).not.toMatch(/[+/=]/)
    })
  })
})
