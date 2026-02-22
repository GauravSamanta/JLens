import { create } from 'zustand'
import type { ParseResult } from '../core/types'
import { parseJson } from '../core/parser'

interface JsonState {
  rawInput: string
  parseResult: ParseResult | null
  parseError: string | null
  expandedNodes: Set<string>
  selectedNodeId: string | null

  rawInputLeft: string
  rawInputRight: string
  parseResultLeft: ParseResult | null
  parseResultRight: ParseResult | null

  setRawInput: (input: string) => void
  setRawInputLeft: (input: string) => void
  setRawInputRight: (input: string) => void
  toggleNode: (nodeId: string) => void
  expandNode: (nodeId: string) => void
  collapseNode: (nodeId: string) => void
  expandAll: () => void
  collapseAll: () => void
  selectNode: (nodeId: string | null) => void
  expandToNode: (nodeId: string) => void
}

function tryParse(input: string): { result: ParseResult | null; error: string | null } {
  if (!input.trim()) return { result: null, error: null }
  try {
    const data = JSON.parse(input)
    return { result: parseJson(data), error: null }
  } catch (e) {
    return { result: null, error: (e as Error).message }
  }
}

export const useJsonStore = create<JsonState>((set, get) => ({
  rawInput: '',
  parseResult: null,
  parseError: null,
  expandedNodes: new Set<string>(['$']),
  selectedNodeId: null,

  rawInputLeft: '',
  rawInputRight: '',
  parseResultLeft: null,
  parseResultRight: null,

  setRawInput: (input) => {
    const { result, error } = tryParse(input)
    set({
      rawInput: input,
      parseResult: result,
      parseError: error,
      expandedNodes: new Set(['$']),
      selectedNodeId: null,
    })
  },

  setRawInputLeft: (input) => {
    const { result } = tryParse(input)
    set({ rawInputLeft: input, parseResultLeft: result })
  },

  setRawInputRight: (input) => {
    const { result } = tryParse(input)
    set({ rawInputRight: input, parseResultRight: result })
  },

  toggleNode: (nodeId) =>
    set((state) => {
      const next = new Set(state.expandedNodes)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return { expandedNodes: next }
    }),

  expandNode: (nodeId) =>
    set((state) => {
      const next = new Set(state.expandedNodes)
      next.add(nodeId)
      return { expandedNodes: next }
    }),

  collapseNode: (nodeId) =>
    set((state) => {
      const next = new Set(state.expandedNodes)
      next.delete(nodeId)
      return { expandedNodes: next }
    }),

  expandAll: () => {
    const { parseResult } = get()
    if (!parseResult) return
    const all = new Set<string>()
    for (const [id, node] of parseResult.nodes) {
      if (node.type === 'object' || node.type === 'array') all.add(id)
    }
    set({ expandedNodes: all })
  },

  collapseAll: () => set({ expandedNodes: new Set(['$']) }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  expandToNode: (nodeId) =>
    set((state) => {
      const { parseResult } = state
      if (!parseResult) return state
      const next = new Set(state.expandedNodes)
      let current = nodeId
      while (current) {
        const node = parseResult.nodes.get(current)
        if (!node) break
        next.add(current)
        if (!node.parentId) break
        current = node.parentId
      }
      return { expandedNodes: next }
    }),
}))
