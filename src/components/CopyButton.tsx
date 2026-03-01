import { useState, useCallback } from 'react'
import Copy from 'lucide-react/dist/esm/icons/copy'
import Check from 'lucide-react/dist/esm/icons/check'

interface CopyButtonProps {
  text: string
  size?: number
  className?: string
  title?: string
}

export function CopyButton({ text, size = 11, className = '', title }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }, [text])

  const defaultClass = 'text-faint hover:text-sub'

  return (
    <button
      onClick={handleCopy}
      className={`transition-colors duration-100 ${className || defaultClass}`}
      title={title ?? 'Copy'}
    >
      {copied ? (
        <Check size={size} className="text-syntax-string" />
      ) : (
        <Copy size={size} />
      )}
    </button>
  )
}
