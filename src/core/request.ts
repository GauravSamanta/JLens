export interface RequestSpec {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
}

export interface RequestParseResult {
  spec: RequestSpec | null
  warnings: string[]
  error?: string
}

const CURL_DATA_FLAGS = new Set(['-d', '--data', '--data-raw', '--data-binary', '--data-ascii'])
const CURL_HEADER_FLAGS = new Set(['-H', '--header'])
const CURL_METHOD_FLAGS = new Set(['-X', '--request'])
const CURL_UNSUPPORTED_WITH_VALUE = new Set([
  '-u',
  '--user',
  '--url-query',
  '--connect-timeout',
  '--max-time',
])

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function stripLineContinuations(input: string): string {
  return input
    .replace(/\\\r?\n/g, ' ')
    .replace(/`\r?\n/g, ' ')
}

function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  let escaped = false

  for (const char of stripLineContinuations(input)) {
    if (escaped) {
      current += char
      escaped = false
      continue
    }

    if (char === '\\' && quote !== "'") {
      escaped = true
      continue
    }

    if ((char === '"' || char === "'") && quote === null) {
      quote = char
      continue
    }

    if (char === quote) {
      quote = null
      continue
    }

    if (/\s/.test(char) && quote === null) {
      if (current) {
        tokens.push(current)
        current = ''
      }
      continue
    }

    current += char
  }

  if (current) tokens.push(current)
  return tokens
}

function parseHeader(value: string): [string, string] | null {
  const separator = value.indexOf(':')
  if (separator <= 0) return null
  const key = value.slice(0, separator).trim()
  const headerValue = value.slice(separator + 1).trim()
  return key ? [key, headerValue] : null
}

function readFlagValue(tokens: string[], index: number, flag: string): { value?: string; nextIndex: number } {
  const equalsValue = flag.includes('=') ? flag.slice(flag.indexOf('=') + 1) : undefined
  if (equalsValue !== undefined) return { value: equalsValue, nextIndex: index }
  return { value: tokens[index + 1], nextIndex: index + 1 }
}

export function parseRequestInput(input: string): RequestParseResult {
  const trimmed = input.trim()
  if (!trimmed) return { spec: null, warnings: [], error: 'Enter a URL or curl command.' }

  if (looksLikeUrl(trimmed)) {
    return {
      spec: { url: trimmed, method: 'GET', headers: {} },
      warnings: [],
    }
  }

  const tokens = tokenize(trimmed)
  if (tokens.length === 0) return { spec: null, warnings: [], error: 'Enter a URL or curl command.' }
  if (tokens[0].toLowerCase() !== 'curl') {
    return { spec: null, warnings: [], error: 'Input must be a URL or a curl command.' }
  }

  let url = ''
  let method = ''
  let body: string | undefined
  const headers: Record<string, string> = {}
  const warnings: string[] = []

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i]
    const flagName = token.includes('=') ? token.slice(0, token.indexOf('=')) : token

    if (CURL_METHOD_FLAGS.has(flagName)) {
      const result = readFlagValue(tokens, i, token)
      if (result.value) method = result.value.toUpperCase()
      i = result.nextIndex
      continue
    }

    if (CURL_HEADER_FLAGS.has(flagName)) {
      const result = readFlagValue(tokens, i, token)
      if (result.value) {
        const parsed = parseHeader(result.value)
        if (parsed) headers[parsed[0]] = parsed[1]
        else warnings.push(`Ignored malformed header: ${result.value}`)
      }
      i = result.nextIndex
      continue
    }

    if (CURL_DATA_FLAGS.has(flagName)) {
      const result = readFlagValue(tokens, i, token)
      if (result.value !== undefined) body = body ? `${body}&${result.value}` : result.value
      i = result.nextIndex
      continue
    }

    if (flagName === '--url') {
      const result = readFlagValue(tokens, i, token)
      if (result.value) url = result.value
      i = result.nextIndex
      continue
    }

    if (CURL_UNSUPPORTED_WITH_VALUE.has(flagName)) {
      const result = readFlagValue(tokens, i, token)
      warnings.push(`Ignored unsupported curl option: ${flagName}`)
      i = result.nextIndex
      continue
    }

    if (token.startsWith('-')) {
      warnings.push(`Ignored unsupported curl option: ${flagName}`)
      continue
    }

    if (looksLikeUrl(token)) url = token
  }

  if (!url) return { spec: null, warnings, error: 'Could not find a URL in the curl command.' }

  return {
    spec: {
      url,
      method: method || (body === undefined ? 'GET' : 'POST'),
      headers,
      body,
    },
    warnings,
  }
}
