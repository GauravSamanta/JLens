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
