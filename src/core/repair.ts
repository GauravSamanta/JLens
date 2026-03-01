import { jsonrepair } from 'jsonrepair'

export interface ParseErrorInfo {
  message: string
  line?: number
  column?: number
  context?: string
}

export interface RepairResult {
  data: unknown
  error: ParseErrorInfo | null
  wasRepaired: boolean
  repairedInput: string | null
}

function extractErrorPosition(message: string): { line?: number; column?: number } {
  const posMatch = message.match(/position\s+(\d+)/i)
  if (!posMatch) return {}

  const position = parseInt(posMatch[1], 10)
  return { column: position }
}

function getErrorContext(input: string, position: number): string {
  const lines = input.split('\n')
  let charCount = 0
  let errorLine = 0

  for (let i = 0; i < lines.length; i++) {
    if (charCount + lines[i].length >= position) {
      errorLine = i
      break
    }
    charCount += lines[i].length + 1
  }

  const start = Math.max(0, errorLine - 1)
  const end = Math.min(lines.length, errorLine + 2)
  return lines.slice(start, end).map((line, i) => {
    const lineNum = start + i + 1
    const marker = (start + i === errorLine) ? '>' : ' '
    return `${marker} ${lineNum} | ${line}`
  }).join('\n')
}

function parseErrorFromException(e: unknown, input: string): ParseErrorInfo {
  const message = (e as Error).message
  const { line, column } = extractErrorPosition(message)

  const posMatch = message.match(/position\s+(\d+)/i)
  const position = posMatch ? parseInt(posMatch[1], 10) : undefined
  const context = position !== undefined ? getErrorContext(input, position) : undefined

  return { message, line, column, context }
}

export function tryParseWithRepair(input: string): RepairResult {
  if (!input.trim()) {
    return { data: null, error: null, wasRepaired: false, repairedInput: null }
  }

  try {
    const data = JSON.parse(input)
    return { data, error: null, wasRepaired: false, repairedInput: null }
  } catch {
    // JSON.parse failed — try repair
  }

  try {
    const repaired = jsonrepair(input)
    const data = JSON.parse(repaired)
    return {
      data,
      error: null,
      wasRepaired: true,
      repairedInput: repaired,
    }
  } catch {
    // repair also failed
  }

  try {
    JSON.parse(input)
  } catch (e) {
    return {
      data: null,
      error: parseErrorFromException(e, input),
      wasRepaired: false,
      repairedInput: null,
    }
  }

  return {
    data: null,
    error: { message: 'Unknown parse error' },
    wasRepaired: false,
    repairedInput: null,
  }
}
