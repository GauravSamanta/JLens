import { useJsonStore } from '../stores/jsonStore'
import { useUIStore } from '../stores/uiStore'

export function DiffInput() {
  const { rawInputLeft, rawInputRight, setRawInputLeft, setRawInputRight } = useJsonStore()
  const isDark = useUIStore((s) => s.theme) === 'dark'

  const border = isDark ? 'border-border' : 'border-border-light'
  const textareaClass = `w-full h-32 resize-y rounded border p-2 font-mono text-sm focus:outline-none ${
    isDark
      ? 'bg-surface border-border text-text-primary placeholder-text-faint focus:border-overlay'
      : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400'
  }`

  return (
    <div className={`flex gap-0 border-b ${border}`}>
      <div className={`flex-1 p-3 border-r ${border}`}>
        <span className={`text-xs font-mono mb-1 block ${isDark ? 'text-text-faint' : 'text-gray-400'}`}>LEFT (original)</span>
        <textarea
          value={rawInputLeft}
          onChange={(e) => setRawInputLeft(e.target.value)}
          placeholder="Paste original JSON..."
          className={textareaClass}
          spellCheck={false}
        />
      </div>
      <div className="flex-1 p-3">
        <span className={`text-xs font-mono mb-1 block ${isDark ? 'text-text-faint' : 'text-gray-400'}`}>RIGHT (modified)</span>
        <textarea
          value={rawInputRight}
          onChange={(e) => setRawInputRight(e.target.value)}
          placeholder="Paste modified JSON..."
          className={textareaClass}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
