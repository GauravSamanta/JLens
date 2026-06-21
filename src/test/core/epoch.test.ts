import { describe, expect, it } from 'vitest'
import { formatEpoch, formatValueWithEpoch } from '../../core/epoch'

describe('formatEpoch', () => {
  it('formats epoch seconds', () => {
    const result = formatEpoch(1704067200)

    expect(result?.iso).toBe('2024-01-01T00:00:00.000Z')
    expect(result?.unit).toBe('seconds')
  })

  it('formats epoch milliseconds', () => {
    const result = formatEpoch(1704067200000)

    expect(result?.iso).toBe('2024-01-01T00:00:00.000Z')
    expect(result?.unit).toBe('milliseconds')
  })

  it('ignores non-integer and out-of-range numbers', () => {
    expect(formatEpoch(123.45)).toBeNull()
    expect(formatEpoch(123)).toBeNull()
    expect(formatEpoch(999999999999999)).toBeNull()
  })
})

describe('formatValueWithEpoch', () => {
  it('appends epoch details for likely epoch values', () => {
    expect(formatValueWithEpoch(1704067200)).toContain('seconds')
    expect(formatValueWithEpoch(1704067200)).toContain('2024')
  })

  it('falls back to JSON stringification for other values', () => {
    expect(formatValueWithEpoch('hello')).toBe('"hello"')
  })
})
