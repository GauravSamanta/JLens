export type JsonNodeType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'

export interface JsonNode {
  id: string
  key: string
  value: unknown
  type: JsonNodeType
  depth: number
  parentId: string | null
  childIds: string[]
  childCount: number
  index: number
}

export interface ParseResult {
  nodes: Map<string, JsonNode>
  rootId: string
  totalNodes: number
  maxDepth: number
}

export interface RepairInfo {
  wasRepaired: boolean
  repairedInput: string
}

export interface ParseErrorInfo {
  message: string
  line?: number
  column?: number
  context?: string
}
