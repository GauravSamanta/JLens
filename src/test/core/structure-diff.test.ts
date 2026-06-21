import { describe, expect, it } from 'vitest'
import { diffJsonStructure } from '../../core/structure-diff'

describe('diffJsonStructure', () => {
  it('ignores primitive value changes when types match', () => {
    const result = diffJsonStructure(
      { id: 1, name: 'Alice', active: true },
      { id: 2, name: 'Bob', active: false }
    )

    expect(result.added).toBe(0)
    expect(result.removed).toBe(0)
    expect(result.modified).toBe(0)
  })

  it('detects added and removed keys', () => {
    const result = diffJsonStructure(
      { id: 1, name: 'Alice', oldField: null },
      { id: 2, name: 'Bob', newField: true }
    )

    expect(result.added).toBe(1)
    expect(result.removed).toBe(1)
    expect(result.entries.find((entry) => entry.path === '$.newField')?.kind).toBe('added')
    expect(result.entries.find((entry) => entry.path === '$.oldField')?.kind).toBe('removed')
  })

  it('detects type changes', () => {
    const result = diffJsonStructure({ id: 1 }, { id: '1' })

    expect(result.modified).toBe(1)
    expect(result.entries[0]).toMatchObject({
      path: '$.id',
      kind: 'modified',
      leftValue: 'number',
      rightValue: 'string',
    })
  })

  it('compares array element shape without comparing array length', () => {
    const result = diffJsonStructure(
      { users: [{ id: 1, name: 'Alice' }] },
      { users: [{ id: 2, name: 'Bob' }, { id: 3, name: 'Carol' }] }
    )

    expect(result.added).toBe(0)
    expect(result.removed).toBe(0)
    expect(result.modified).toBe(0)
  })

  it('detects nested array element shape changes', () => {
    const result = diffJsonStructure(
      { users: [{ id: 1, name: 'Alice' }] },
      { users: [{ id: 2, email: 'alice@example.com' }] }
    )

    expect(result.added).toBe(1)
    expect(result.removed).toBe(1)
    expect(result.entries.find((entry) => entry.path === '$.users[].email')?.kind).toBe('added')
    expect(result.entries.find((entry) => entry.path === '$.users[].name')?.kind).toBe('removed')
  })
})
