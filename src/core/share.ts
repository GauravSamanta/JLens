import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

const MAX_SHAREABLE_SIZE = 100_000

export function encodeJsonToHash(json: string): string | null {
  if (!json || json.length > MAX_SHAREABLE_SIZE) return null
  try {
    return compressToEncodedURIComponent(json)
  } catch {
    return null
  }
}

export function decodeJsonFromHash(hash: string): string | null {
  if (!hash) return null
  try {
    const result = decompressFromEncodedURIComponent(hash)
    return result || null
  } catch {
    return null
  }
}
