import { describe, it, expect } from 'vitest'
import { parseJson } from '../core/parser'
import { searchNodes } from '../core/search'
import { diffJson } from '../core/diff'
import { encodeJsonToHash, decodeJsonFromHash } from '../core/share'

describe('integration: parse -> search workflow', () => {
  const apiResponse = {
    status: 200,
    data: {
      users: [
        { id: 1, name: 'Alice', email: 'alice@example.com', active: true },
        { id: 2, name: 'Bob', email: 'bob@example.com', active: false },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', active: true },
      ],
      pagination: { page: 1, total: 100, per_page: 20 },
    },
    errors: null,
    request_id: 'req-abc-123',
  }

  it('parses then searches by key across nested structure', () => {
    const parsed = parseJson(apiResponse)
    const emailMatches = searchNodes(parsed, 'key:email')

    expect(emailMatches.length).toBe(3)
    expect(emailMatches).toContain('$.data.users[0].email')
    expect(emailMatches).toContain('$.data.users[1].email')
    expect(emailMatches).toContain('$.data.users[2].email')
  })

  it('parses then searches by value to find specific user', () => {
    const parsed = parseJson(apiResponse)
    const bobMatches = searchNodes(parsed, 'value:bob@example.com')

    expect(bobMatches.length).toBe(1)
    expect(bobMatches[0]).toBe('$.data.users[1].email')

    const bobNode = parsed.nodes.get(bobMatches[0])!
    expect(bobNode.parentId).toBe('$.data.users[1]')
  })

  it('searches for request_id to debug a specific request', () => {
    const parsed = parseJson(apiResponse)
    const matches = searchNodes(parsed, 'req-abc')

    expect(matches.length).toBe(1)
    const node = parsed.nodes.get(matches[0])!
    expect(node.value).toBe('req-abc-123')
  })
})

describe('integration: diff workflow', () => {
  it('compares two API versions to find changes', () => {
    const v1 = {
      api_version: '1.0',
      endpoints: ['/users', '/posts'],
      auth: { type: 'basic' },
    }
    const v2 = {
      api_version: '2.0',
      endpoints: ['/users', '/posts', '/comments'],
      auth: { type: 'oauth2', scopes: ['read', 'write'] },
    }

    const result = diffJson(v1, v2)

    const versionChange = result.entries.find((e) => e.path === '$.api_version')!
    expect(versionChange.kind).toBe('modified')
    expect(versionChange.leftValue).toBe('1.0')
    expect(versionChange.rightValue).toBe('2.0')

    const addedEndpoint = result.entries.find((e) => e.path === '$.endpoints[2]')!
    expect(addedEndpoint.kind).toBe('added')
    expect(addedEndpoint.rightValue).toBe('/comments')

    const authChange = result.entries.find((e) => e.path === '$.auth.type')!
    expect(authChange.kind).toBe('modified')

    const scopesAdded = result.entries.find((e) => e.path === '$.auth.scopes')!
    expect(scopesAdded.kind).toBe('added')
  })
})

describe('integration: share workflow', () => {
  it('round-trips a realistic JSON payload via URL hash', () => {
    const payload = JSON.stringify({
      config: { theme: 'dark', lang: 'en' },
      filters: [{ field: 'status', value: 'active' }],
    })

    const hash = encodeJsonToHash(payload)!
    expect(hash).toBeTruthy()

    const decoded = decodeJsonFromHash(hash)!
    expect(decoded).toBe(payload)

    const reparsed = JSON.parse(decoded)
    expect(reparsed.config.theme).toBe('dark')
    expect(reparsed.filters[0].field).toBe('status')
  })
})

describe('integration: parse -> navigate -> inspect', () => {
  it('traverses parent chain from deep node to root', () => {
    const data = { level1: { level2: { level3: { target: 'found' } } } }
    const parsed = parseJson(data)

    const targetNode = parsed.nodes.get('$.level1.level2.level3.target')!
    expect(targetNode.value).toBe('found')

    const ancestors: string[] = []
    let current: string | null = targetNode.parentId
    while (current) {
      ancestors.push(current)
      const node = parsed.nodes.get(current)
      current = node?.parentId ?? null
    }

    expect(ancestors).toEqual(['$.level1.level2.level3', '$.level1.level2', '$.level1', '$'])
  })

  it('reconstructs array structure from parsed nodes', () => {
    const data = { items: [10, 20, 30] }
    const parsed = parseJson(data)

    const arrayNode = parsed.nodes.get('$.items')!
    const values = arrayNode.childIds.map((id) => parsed.nodes.get(id)!.value)
    expect(values).toEqual([10, 20, 30])
  })
})

describe('integration: performance with larger payloads', () => {
  it('handles 1000 items without issue', () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      tags: ['a', 'b'],
    }))
    const data = { items, total: 1000 }

    const start = performance.now()
    const parsed = parseJson(data)
    const parseTime = performance.now() - start

    expect(parsed.totalNodes).toBeGreaterThan(5000)
    expect(parseTime).toBeLessThan(1000)

    const searchStart = performance.now()
    const matches = searchNodes(parsed, 'Item 500')
    const searchTime = performance.now() - searchStart

    expect(matches.length).toBe(1)
    expect(searchTime).toBeLessThan(500)
  })

  it('diffs two large payloads efficiently', () => {
    const makePayload = (prefix: string) =>
      Object.fromEntries(
        Array.from({ length: 200 }, (_, i) => [`key_${i}`, `${prefix}_${i}`])
      )

    const start = performance.now()
    const result = diffJson(makePayload('left'), makePayload('right'))
    const diffTime = performance.now() - start

    expect(result.modified).toBe(200)
    expect(diffTime).toBeLessThan(500)
  })
})
