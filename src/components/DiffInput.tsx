import { useJsonStore } from '../stores/jsonStore'
import { useUIStore } from '../stores/uiStore'

export function DiffInput() {
  const { rawInputLeft, rawInputRight, setRawInputLeft, setRawInputRight } = useJsonStore()
  const isDark = useUIStore((s) => s.theme) === 'dark'

  const border = isDark ? 'border-border' : 'border-border-light'
  const inputClass = isDark
    ? 'bg-surface border-border text-text-primary placeholder-text-faint focus:border-accent-blue/40'
    : 'bg-white border-border-light text-text-light placeholder-text-light-secondary focus:border-blue-400/50'

  return (
    <div className={`flex gap-0 border-b ${border}`}>
      <div className={`flex-1 p-3 border-r ${border}`}>
        <span className={`text-[10px] font-medium tracking-widest uppercase mb-1.5 block ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
          Original
        </span>
        <textarea
          value={rawInputLeft}
          onChange={(e) => setRawInputLeft(e.target.value)}
          placeholder="Paste original JSON\u2026"
          className={`w-full h-28 resize-y rounded-lg border p-2.5 font-mono text-[13px] leading-relaxed focus:outline-none transition-colors ${inputClass}`}
          spellCheck={false}
        />
      </div>
      <div className="flex-1 p-3">
        <span className={`text-[10px] font-medium tracking-widest uppercase mb-1.5 block ${isDark ? 'text-text-faint' : 'text-text-light-secondary'}`}>
          Modified
        </span>
        <textarea
          value={rawInputRight}
          onChange={(e) => setRawInputRight(e.target.value)}
          placeholder="Paste modified JSON\u2026"
          className={`w-full h-28 resize-y rounded-lg border p-2.5 font-mono text-[13px] leading-relaxed focus:outline-none transition-colors ${inputClass}`}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
