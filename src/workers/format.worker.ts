export interface FormatRequest {
  jsonString: string
}

export interface FormatResponse {
  success: boolean
  formatted?: string
  error?: string
}

self.onmessage = (e: MessageEvent<FormatRequest>) => {
  try {
    const parsed = JSON.parse(e.data.jsonString)
    const formatted = JSON.stringify(parsed, null, 2)
    const response: FormatResponse = { success: true, formatted }
    self.postMessage(response)
  } catch (err) {
    const response: FormatResponse = { success: false, error: (err as Error).message }
    self.postMessage(response)
  }
}
