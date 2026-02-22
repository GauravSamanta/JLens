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

  it('searches keys and values by default', () => {
    const matches = searchNodes(parsed, 'request_id')
    expect(matches.length).toBe(2)
  })

  it('searches by key prefix', () => {
    const matches = searchNodes(parsed, 'key:name')
    expect(matches.length).toBe(3) // user.name, items[0].name, items[1].name
  })

  it('searches by value prefix', () => {
    const matches = searchNodes(parsed, 'value:abc-123')
    expect(matches.length).toBe(1)
    expect(matches[0]).toBe('$.request_id')
  })

  it('case-insensitive search', () => {
    const matches = searchNodes(parsed, 'alice')
    expect(matches.length).toBe(1)
  })

  it('returns empty for no match', () => {
    const matches = searchNodes(parsed, 'zzz_not_found')
    expect(matches.length).toBe(0)
  })

  it('handles empty query', () => {
    const matches = searchNodes(parsed, '')
    expect(matches.length).toBe(0)
  })
})
