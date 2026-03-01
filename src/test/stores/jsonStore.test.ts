import { describe, it, expect, beforeEach } from 'vitest'
import { useJsonStore } from '../../stores/jsonStore'
import { act } from '@testing-library/react'

describe('jsonStore', () => {
  beforeEach(() => {
    act(() => {
      useJsonStore.setState({
        rawInput: '',
        parseResult: null,
        parseError: null,
        repairInfo: null,
        isParsing: false,
        expandedNodes: new Set(['$']),
        selectedNodeId: null,
        rawInputLeft: '',
        rawInputRight: '',
        parseResultLeft: null,
        parseResultRight: null,
      })
    })
  })

  describe('setRawInput', () => {
    it('parses valid JSON and sets parseResult', () => {
      act(() => useJsonStore.getState().setRawInput('{"a":1}'))

      const state = useJsonStore.getState()
      expect(state.parseResult).not.toBeNull()
      expect(state.parseError).toBeNull()
      expect(state.parseResult!.totalNodes).toBe(2)
    })

    it('sets parseError for invalid JSON', () => {
      act(() => useJsonStore.getState().setRawInput('totally broken {{{}}}'))

      const state = useJsonStore.getState()
      expect(state.parseResult).toBeNull()
      expect(state.parseError).not.toBeNull()
      expect(state.parseError!.message).toBeTruthy()
    })

    it('clears everything on empty input', () => {
      act(() => useJsonStore.getState().setRawInput('{"a":1}'))
      act(() => useJsonStore.getState().setRawInput(''))

      const state = useJsonStore.getState()
      expect(state.rawInput).toBe('')
      expect(state.parseResult).toBeNull()
      expect(state.parseError).toBeNull()
      expect(state.selectedNodeId).toBeNull()
    })

    it('clears everything on whitespace-only input', () => {
      act(() => useJsonStore.getState().setRawInput('   '))

      const state = useJsonStore.getState()
      expect(state.parseResult).toBeNull()
      expect(state.parseError).toBeNull()
    })

    it('resets expandedNodes to root on new input', () => {
      act(() => useJsonStore.getState().setRawInput('{"a":{"b":1}}'))
      act(() => useJsonStore.getState().expandNode('$.a'))

      expect(useJsonStore.getState().expandedNodes.has('$.a')).toBe(true)

      act(() => useJsonStore.getState().setRawInput('{"x":1}'))

      const state = useJsonStore.getState()
      expect(state.expandedNodes.has('$.a')).toBe(false)
      expect(state.expandedNodes.has('$')).toBe(true)
    })

    it('resets selectedNodeId on new input', () => {
      act(() => useJsonStore.getState().setRawInput('{"a":1}'))
      act(() => useJsonStore.getState().selectNode('$.a'))
      expect(useJsonStore.getState().selectedNodeId).toBe('$.a')

      act(() => useJsonStore.getState().setRawInput('{"b":2}'))
      expect(useJsonStore.getState().selectedNodeId).toBeNull()
    })

    it('handles complex JSON correctly', () => {
      const json = JSON.stringify({
        users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
        meta: { total: 2 },
      })
      act(() => useJsonStore.getState().setRawInput(json))

      const state = useJsonStore.getState()
      expect(state.parseResult!.nodes.get('$.users[0].name')!.value).toBe('Alice')
    })
  })

  describe('lenient parsing', () => {
    it('repairs malformed JSON and sets repairInfo', () => {
      act(() => useJsonStore.getState().setRawInput('{a: 1, b: 2,}'))

      const state = useJsonStore.getState()
      expect(state.parseResult).not.toBeNull()
      expect(state.parseError).toBeNull()
      expect(state.repairInfo).not.toBeNull()
      expect(state.repairInfo!.wasRepaired).toBe(true)
    })

    it('does not set repairInfo for valid JSON', () => {
      act(() => useJsonStore.getState().setRawInput('{"a": 1}'))

      const state = useJsonStore.getState()
      expect(state.parseResult).not.toBeNull()
      expect(state.repairInfo).toBeNull()
    })

    it('sets rich parseError for truly broken JSON', () => {
      act(() => useJsonStore.getState().setRawInput('totally not json {{{}}}'))

      const state = useJsonStore.getState()
      expect(state.parseResult).toBeNull()
      expect(state.parseError).not.toBeNull()
      expect(state.parseError!.message).toBeTruthy()
    })
  })

  describe('node expansion', () => {
    beforeEach(() => {
      act(() => useJsonStore.getState().setRawInput('{"a":{"b":{"c":1}},"d":[1,2]}'))
    })

    it('toggleNode adds then removes from expanded set', () => {
      act(() => useJsonStore.getState().toggleNode('$.a'))
      expect(useJsonStore.getState().expandedNodes.has('$.a')).toBe(true)

      act(() => useJsonStore.getState().toggleNode('$.a'))
      expect(useJsonStore.getState().expandedNodes.has('$.a')).toBe(false)
    })

    it('expandNode adds to expanded set', () => {
      act(() => useJsonStore.getState().expandNode('$.a'))
      expect(useJsonStore.getState().expandedNodes.has('$.a')).toBe(true)
    })

    it('collapseNode removes from expanded set', () => {
      act(() => useJsonStore.getState().expandNode('$.a'))
      act(() => useJsonStore.getState().collapseNode('$.a'))
      expect(useJsonStore.getState().expandedNodes.has('$.a')).toBe(false)
    })

    it('expandAll expands every container node', () => {
      act(() => useJsonStore.getState().expandAll())

      const expanded = useJsonStore.getState().expandedNodes
      expect(expanded.has('$')).toBe(true)
      expect(expanded.has('$.a')).toBe(true)
      expect(expanded.has('$.a.b')).toBe(true)
      expect(expanded.has('$.d')).toBe(true)
    })

    it('expandAll does not include leaf nodes', () => {
      act(() => useJsonStore.getState().expandAll())

      const expanded = useJsonStore.getState().expandedNodes
      expect(expanded.has('$.a.b.c')).toBe(false)
    })

    it('collapseAll collapses to just root', () => {
      act(() => useJsonStore.getState().expandAll())
      act(() => useJsonStore.getState().collapseAll())

      const expanded = useJsonStore.getState().expandedNodes
      expect(expanded.size).toBe(1)
      expect(expanded.has('$')).toBe(true)
    })
  })

  describe('expandToNode', () => {
    beforeEach(() => {
      act(() => useJsonStore.getState().setRawInput('{"a":{"b":{"c":1}}}'))
    })

    it('expands all ancestors of a deep node', () => {
      act(() => useJsonStore.getState().expandToNode('$.a.b.c'))

      const expanded = useJsonStore.getState().expandedNodes
      expect(expanded.has('$')).toBe(true)
      expect(expanded.has('$.a')).toBe(true)
      expect(expanded.has('$.a.b')).toBe(true)
      expect(expanded.has('$.a.b.c')).toBe(true)
    })
  })

  describe('selectNode', () => {
    it('sets selectedNodeId', () => {
      act(() => useJsonStore.getState().selectNode('$.foo'))
      expect(useJsonStore.getState().selectedNodeId).toBe('$.foo')
    })

    it('clears selectedNodeId with null', () => {
      act(() => useJsonStore.getState().selectNode('$.foo'))
      act(() => useJsonStore.getState().selectNode(null))
      expect(useJsonStore.getState().selectedNodeId).toBeNull()
    })
  })

  describe('diff inputs', () => {
    it('setRawInputLeft parses and stores result', () => {
      act(() => useJsonStore.getState().setRawInputLeft('{"a":1}'))

      const state = useJsonStore.getState()
      expect(state.rawInputLeft).toBe('{"a":1}')
      expect(state.parseResultLeft).not.toBeNull()
    })

    it('setRawInputRight parses and stores result', () => {
      act(() => useJsonStore.getState().setRawInputRight('{"b":2}'))

      const state = useJsonStore.getState()
      expect(state.rawInputRight).toBe('{"b":2}')
      expect(state.parseResultRight).not.toBeNull()
    })

    it('handles invalid left input gracefully', () => {
      act(() => useJsonStore.getState().setRawInputLeft('totally broken {{{}}}'))
      expect(useJsonStore.getState().parseResultLeft).toBeNull()
    })

    it('handles invalid right input gracefully', () => {
      act(() => useJsonStore.getState().setRawInputRight('totally broken {{{}}}'))
      expect(useJsonStore.getState().parseResultRight).toBeNull()
    })
  })
})
