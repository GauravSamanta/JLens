import { useState, useCallback } from 'react'
import Copy from 'lucide-react/dist/esm/icons/copy'
import Check from 'lucide-react/dist/esm/icons/check'
import { useUIStore } from '../stores/uiStore'

interface CopyButtonProps {
  text: string
  size?: number
  className?: string
  title?: string
}

export function CopyButton({ text, size = 11, className = '', title }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const isDark = useUIStore((s) => s.theme) === 'dark'

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }, [text])

  const defaultClass = isDark ? 'text-subtle hover:text-text-secondary' : 'text-gray-400 hover:text-gray-600'

  return (
    <button
      onClick={handleCopy}
      className={`transition-colors duration-100 ${className || defaultClass}`}
      title={title ?? 'Copy'}
    >
      {copied ? (
        <Check size={size} className="text-accent-green" />
      ) : (
        <Copy size={size} />
      )}
    </button>
  )
}
