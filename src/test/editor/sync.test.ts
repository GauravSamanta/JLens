import { describe, it, expect } from 'vitest'
import { EditorState } from '@codemirror/state'
import { json } from '@codemirror/lang-json'
import { getJsonPathAtPosition, getPositionForPath } from '../../editor/sync'

function createState(doc: string): EditorState {
  return EditorState.create({
    doc,
    extensions: [json()],
  })
}

describe('getJsonPathAtPosition', () => {
  it('returns $ for root object', () => {
    const state = createState('{"a": 1}')
    const path = getJsonPathAtPosition(state, 1)
    expect(path).toBeTruthy()
  })

  it('returns path for a nested key', () => {
    const state = createState('{"name": "Alice"}')
    const path = getJsonPathAtPosition(state, 10)
    expect(path).toContain('name')
  })

  it('returns null for empty document', () => {
    const state = createState('')
    const path = getJsonPathAtPosition(state, 0)
    expect(path).toBeNull()
  })
})

describe('getPositionForPath', () => {
  const jsonStr = '{"users": [{"name": "Alice"}, {"name": "Bob"}], "count": 2}'

  it('returns range for root path $', () => {
    const state = createState(jsonStr)
    const range = getPositionForPath(state, '$')
    expect(range).not.toBeNull()
    expect(range!.from).toBe(0)
    expect(range!.to).toBe(jsonStr.length)
  })

  it('returns range for a top-level key', () => {
    const state = createState(jsonStr)
    const range = getPositionForPath(state, '$.count')
    expect(range).not.toBeNull()
    const value = jsonStr.slice(range!.from, range!.to)
    expect(value.trim()).toBe('2')
  })

  it('returns range for an array element', () => {
    const state = createState(jsonStr)
    const range = getPositionForPath(state, '$.users[0]')
    expect(range).not.toBeNull()
    const value = jsonStr.slice(range!.from, range!.to)
    expect(value).toContain('Alice')
  })

  it('returns range for a nested key in array element', () => {
    const state = createState(jsonStr)
    const range = getPositionForPath(state, '$.users[1].name')
    expect(range).not.toBeNull()
    const value = jsonStr.slice(range!.from, range!.to)
    expect(value).toBe('"Bob"')
  })

  it('returns null for non-existent path', () => {
    const state = createState(jsonStr)
    const range = getPositionForPath(state, '$.nonexistent')
    expect(range).toBeNull()
  })

  it('returns null for out-of-bounds array index', () => {
    const state = createState(jsonStr)
    const range = getPositionForPath(state, '$.users[99]')
    expect(range).toBeNull()
  })

  it('handles simple values', () => {
    const state = createState('42')
    const range = getPositionForPath(state, '$')
    expect(range).not.toBeNull()
    expect(state.doc.sliceString(range!.from, range!.to)).toBe('42')
  })

  it('handles deeply nested paths', () => {
    const state = createState('{"a": {"b": {"c": 3}}}')
    const range = getPositionForPath(state, '$.a.b.c')
    expect(range).not.toBeNull()
    expect(state.doc.sliceString(range!.from, range!.to)).toBe('3')
  })
})
