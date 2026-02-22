import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useVisibleNodes } from '../../hooks/useVisibleNodes'
import { parseJson } from '../../core/parser'

describe('useVisibleNodes', () => {
  const data = {
    name: 'Alice',
    address: {
      city: 'NYC',
      zip: '10001',
    },
    tags: ['admin', 'user'],
  }
  const parsed = parseJson(data)

  it('returns empty array when parseResult is null', () => {
    const { result } = renderHook(() => useVisibleNodes(null, new Set()))
    expect(result.current).toEqual([])
  })

  it('returns only root when nothing is expanded', () => {
    const { result } = renderHook(() => useVisibleNodes(parsed, new Set()))
    expect(result.current).toEqual(['$'])
  })

  it('shows direct children when root is expanded', () => {
    const expanded = new Set(['$'])
    const { result } = renderHook(() => useVisibleNodes(parsed, expanded))

    expect(result.current).toContain('$')
    expect(result.current).toContain('$.name')
    expect(result.current).toContain('$.address')
    expect(result.current).toContain('$.tags')
    expect(result.current).not.toContain('$.address.city')
  })

  it('shows nested children when parent is expanded', () => {
    const expanded = new Set(['$', '$.address'])
    const { result } = renderHook(() => useVisibleNodes(parsed, expanded))

    expect(result.current).toContain('$.address.city')
    expect(result.current).toContain('$.address.zip')
    expect(result.current).not.toContain('$.tags[0]')
  })

  it('shows array children when array is expanded', () => {
    const expanded = new Set(['$', '$.tags'])
    const { result } = renderHook(() => useVisibleNodes(parsed, expanded))

    expect(result.current).toContain('$.tags[0]')
    expect(result.current).toContain('$.tags[1]')
  })

  it('shows all nodes when everything is expanded', () => {
    const expanded = new Set(['$', '$.address', '$.tags'])
    const { result } = renderHook(() => useVisibleNodes(parsed, expanded))

    expect(result.current.length).toBe(parsed.totalNodes)
  })

  it('maintains correct tree order', () => {
    const expanded = new Set(['$', '$.address', '$.tags'])
    const { result } = renderHook(() => useVisibleNodes(parsed, expanded))

    const nameIdx = result.current.indexOf('$.name')
    const addressIdx = result.current.indexOf('$.address')
    const cityIdx = result.current.indexOf('$.address.city')
    const tagsIdx = result.current.indexOf('$.tags')
    const tag0Idx = result.current.indexOf('$.tags[0]')

    expect(nameIdx).toBeLessThan(addressIdx)
    expect(addressIdx).toBeLessThan(cityIdx)
    expect(cityIdx).toBeLessThan(tagsIdx)
    expect(tagsIdx).toBeLessThan(tag0Idx)
  })

  it('handles deeply nested expansion', () => {
    const deep = parseJson({ a: { b: { c: { d: 'leaf' } } } })
    const expanded = new Set(['$', '$.a', '$.a.b', '$.a.b.c'])
    const { result } = renderHook(() => useVisibleNodes(deep, expanded))

    expect(result.current).toEqual(['$', '$.a', '$.a.b', '$.a.b.c', '$.a.b.c.d'])
  })

  it('handles empty object', () => {
    const empty = parseJson({})
    const expanded = new Set(['$'])
    const { result } = renderHook(() => useVisibleNodes(empty, expanded))

    expect(result.current).toEqual(['$'])
  })
})
