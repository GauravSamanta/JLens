import { useCallback, useState } from 'react'
import { useJsonStore } from '../stores/jsonStore'
import { encodeJsonToHash, decodeJsonFromHash } from '../core/share'

export function useShareUrl() {
  const { rawInput, setRawInput } = useJsonStore()
  const [showCopied, setShowCopied] = useState(false)

  const generateShareUrl = useCallback(() => {
    const hash = encodeJsonToHash(rawInput)
    if (!hash) return null
    return `${window.location.origin}${window.location.pathname}#json=${hash}`
  }, [rawInput])

  const copyShareUrl = useCallback(async () => {
    const url = generateShareUrl()
    if (!url) return false
    try {
      await navigator.clipboard.writeText(url)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
      return true
    } catch {
      return false
    }
  }, [generateShareUrl])

  const loadFromUrl = useCallback(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#json=')) return false
    const encoded = hash.slice(6)
    const json = decodeJsonFromHash(encoded)
    if (json) {
      setRawInput(json)
      // Clean up the URL hash
      window.history.replaceState(null, '', window.location.pathname)
      return true
    }
    return false
  }, [setRawInput])

  const canShare = rawInput.trim().length > 0 && rawInput.length <= 100_000

  return { generateShareUrl, copyShareUrl, loadFromUrl, canShare, showCopied }
}
