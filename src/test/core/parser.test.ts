import { describe, it, expect } from 'vitest'
import { parseJson } from '../../core/parser'

describe('parseJson', () => {
  it('parses a simple object', () => {
    const result = parseJson({ name: 'Alice', age: 30 })
    expect(result.totalNodes).toBe(3)
    expect(result.rootId).toBe('$')

    const root = result.nodes.get('$')!
    expect(root.type).toBe('object')
    expect(root.childCount).toBe(2)

    const name = result.nodes.get('$.name')!
    expect(name.type).toBe('string')
    expect(name.value).toBe('Alice')
    expect(name.key).toBe('name')
    expect(name.depth).toBe(1)
  })

  it('parses nested objects', () => {
    const result = parseJson({ user: { address: { city: 'NYC' } } })
    expect(result.maxDepth).toBe(3)

    const city = result.nodes.get('$.user.address.city')!
    expect(city.value).toBe('NYC')
    expect(city.depth).toBe(3)
    expect(city.parentId).toBe('$.user.address')
  })

  it('parses arrays', () => {
    const result = parseJson({ items: [1, 2, 3] })
    const items = result.nodes.get('$.items')!
    expect(items.type).toBe('array')
    expect(items.childCount).toBe(3)

    const second = result.nodes.get('$.items[1]')!
    expect(second.value).toBe(2)
    expect(second.key).toBe('[1]')
  })

  it('handles null and boolean values', () => {
    const result = parseJson({ active: true, deleted: false, notes: null })
    expect(result.nodes.get('$.active')!.type).toBe('boolean')
    expect(result.nodes.get('$.active')!.value).toBe(true)
    expect(result.nodes.get('$.notes')!.type).toBe('null')
    expect(result.nodes.get('$.notes')!.value).toBeNull()
  })

  it('handles empty objects and arrays', () => {
    const result = parseJson({ obj: {}, arr: [] })
    expect(result.nodes.get('$.obj')!.childCount).toBe(0)
    expect(result.nodes.get('$.arr')!.childCount).toBe(0)
  })

  it('handles top-level array', () => {
    const result = parseJson([1, 2, 3])
    expect(result.rootId).toBe('$')
    const root = result.nodes.get('$')!
    expect(root.type).toBe('array')
    expect(root.childCount).toBe(3)
  })

  it('handles top-level primitive', () => {
    const result = parseJson('hello')
    const root = result.nodes.get('$')!
    expect(root.type).toBe('string')
    expect(root.value).toBe('hello')
  })
})
