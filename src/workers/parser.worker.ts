import { parseJson } from '../core/parser'
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
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  try {
    const data = JSON.parse(e.data.jsonString)
    const result = parseJson(data)

    const response: WorkerResponse = {
      success: true,
      result: {
        nodes: Array.from(result.nodes.entries()),
        rootId: result.rootId,
        totalNodes: result.totalNodes,
        maxDepth: result.maxDepth,
      },
    }

    self.postMessage(response)
  } catch (err) {
    const response: WorkerResponse = {
      success: false,
      error: (err as Error).message,
    }
    self.postMessage(response)
  }
}
