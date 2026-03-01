import { parseJson } from '../core/parser'
import { tryParseWithRepair } from '../core/repair'
import type { JsonNode } from '../core/types'

export interface WorkerRequest {
  jsonString: string
}

export interface WorkerResponse {
  success: boolean
  result?: {
    nodes: [string, JsonNode][]
    rootId: string
    totalNodes: number
    maxDepth: number
  }
  error?: string
  wasRepaired?: boolean
  repairedInput?: string
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const repair = tryParseWithRepair(e.data.jsonString)

  if (repair.data !== null) {
    const result = parseJson(repair.data)
    const response: WorkerResponse = {
      success: true,
      result: {
        nodes: Array.from(result.nodes.entries()),
        rootId: result.rootId,
        totalNodes: result.totalNodes,
        maxDepth: result.maxDepth,
      },
      wasRepaired: repair.wasRepaired,
      repairedInput: repair.repairedInput ?? undefined,
    }
    self.postMessage(response)
  } else {
    const response: WorkerResponse = {
      success: false,
      error: repair.error?.message ?? 'Parse failed',
    }
    self.postMessage(response)
  }
}
