import { create } from 'zustand'
import type { ParseResult, JsonNode, RepairInfo, ParseErrorInfo } from '../core/types'
import { parseJson } from '../core/parser'
import { tryParseWithRepair } from '../core/repair'
import type { WorkerResponse } from '../workers/parser.worker'

interface JsonState {
  rawInput: string
  parseResult: ParseResult | null
  parseError: ParseErrorInfo | null
  repairInfo: RepairInfo | null
  isParsing: boolean
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

function tryParse(input: string): {
  result: ParseResult | null
  error: ParseErrorInfo | null
  repairInfo: RepairInfo | null
} {
  if (!input.trim()) return { result: null, error: null, repairInfo: null }

  const repair = tryParseWithRepair(input)

  if (repair.data !== null) {
    const result = parseJson(repair.data)
    const repairInfo = repair.wasRepaired && repair.repairedInput
      ? { wasRepaired: true, repairedInput: repair.repairedInput }
      : null
    return { result, error: null, repairInfo }
  }

  return { result: null, error: repair.error, repairInfo: null }
}

const WORKER_THRESHOLD = 5_000_000
let parserWorker: Worker | null = null

function getWorker(): Worker {
  if (!parserWorker) {
    parserWorker = new Worker(
      new URL('../workers/parser.worker.ts', import.meta.url),
      { type: 'module' }
    )
  }
  return parserWorker
}

export const useJsonStore = create<JsonState>((set, get) => ({
  rawInput: '',
  parseResult: null,
  parseError: null,
  repairInfo: null,
  isParsing: false,
  expandedNodes: new Set<string>(['$']),
  selectedNodeId: null,

  rawInputLeft: '',
  rawInputRight: '',
  parseResultLeft: null,
  parseResultRight: null,

  setRawInput: (input) => {
    if (!input.trim()) {
      set({
        rawInput: '',
        parseResult: null,
        parseError: null,
        repairInfo: null,
        isParsing: false,
        expandedNodes: new Set(['$']),
        selectedNodeId: null,
      })
      return
    }

    if (input.length < WORKER_THRESHOLD) {
      const { result, error, repairInfo } = tryParse(input)
      set({
        rawInput: input,
        parseResult: result,
        parseError: error,
        repairInfo,
        isParsing: false,
        expandedNodes: new Set(['$']),
        selectedNodeId: null,
      })
    } else {
      set({ rawInput: input, isParsing: true, parseResult: null, parseError: null })

      const worker = getWorker()
      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const response = e.data
        if (response.success && response.result) {
          const nodes = new Map<string, JsonNode>(response.result.nodes)
          set({
            parseResult: {
              nodes,
              rootId: response.result.rootId,
              totalNodes: response.result.totalNodes,
              maxDepth: response.result.maxDepth,
            },
            parseError: null,
            isParsing: false,
            expandedNodes: new Set(['$']),
            selectedNodeId: null,
          })
        } else {
          set({
            parseResult: null,
            parseError: response.error || 'Parse failed',
            isParsing: false,
          })
        }
      }
      worker.postMessage({ jsonString: input })
    }
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
