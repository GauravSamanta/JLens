import { describe, expect, it } from 'vitest'
import { parseRequestInput } from '../../core/request'

describe('parseRequestInput', () => {
  it('parses a plain URL as a GET request', () => {
    const result = parseRequestInput('https://api.example.com/users')

    expect(result.spec).toEqual({
      url: 'https://api.example.com/users',
      method: 'GET',
      headers: {},
    })
    expect(result.warnings).toEqual([])
  })

  it('parses curl method, headers, URL, and body', () => {
    const result = parseRequestInput(
      'curl -X PATCH -H "Authorization: Bearer token" -H "Content-Type: application/json" --data-raw \'{"a":1}\' https://api.example.com/users/1'
    )

    expect(result.spec).toEqual({
      url: 'https://api.example.com/users/1',
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
      },
      body: '{"a":1}',
    })
  })

  it('defaults curl requests with data to POST', () => {
    const result = parseRequestInput('curl -d "a=1" https://api.example.com/search')

    expect(result.spec?.method).toBe('POST')
    expect(result.spec?.body).toBe('a=1')
  })

  it('returns warnings for unsupported curl options', () => {
    const result = parseRequestInput('curl --compressed -u user:pass https://api.example.com/users')

    expect(result.spec?.url).toBe('https://api.example.com/users')
    expect(result.warnings).toContain('Ignored unsupported curl option: --compressed')
    expect(result.warnings).toContain('Ignored unsupported curl option: -u')
  })

  it('fails when no URL is present', () => {
    const result = parseRequestInput('curl -H "Accept: application/json"')

    expect(result.spec).toBeNull()
    expect(result.error).toBe('Could not find a URL in the curl command.')
  })
})
